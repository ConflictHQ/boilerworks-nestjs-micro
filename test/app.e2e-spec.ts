import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { createHash, randomBytes } from 'crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('App (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  // Full-scope key for most tests
  let fullScopeKey: string;

  // Restricted key with only events.read scope (no events.write, no keys.manage)
  let readOnlyKey: string;

  // Key with no scopes at all
  let noScopeKey: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = app.get(PrismaService);

    // Create full-scope test API key directly in the database
    fullScopeKey = randomBytes(32).toString('hex');
    const fullScopeHash = createHash('sha256').update(fullScopeKey).digest('hex');
    await prisma.apiKey.create({
      data: {
        name: 'test-full-scope',
        keyHash: fullScopeHash,
        scopes: ['events.read', 'events.write', 'keys.manage'],
        isActive: true,
      },
    });

    // Create read-only test API key
    readOnlyKey = randomBytes(32).toString('hex');
    const readOnlyHash = createHash('sha256').update(readOnlyKey).digest('hex');
    await prisma.apiKey.create({
      data: {
        name: 'test-read-only',
        keyHash: readOnlyHash,
        scopes: ['events.read'],
        isActive: true,
      },
    });

    // Create no-scope test API key
    noScopeKey = randomBytes(32).toString('hex');
    const noScopeHash = createHash('sha256').update(noScopeKey).digest('hex');
    await prisma.apiKey.create({
      data: {
        name: 'test-no-scope',
        keyHash: noScopeHash,
        scopes: [],
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.event.deleteMany({
      where: { type: { startsWith: 'test.' } },
    });
    await prisma.apiKey.deleteMany({
      where: { name: { startsWith: 'test-' } },
    });
    await app.close();
  });

  // ─── Health ──────────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('returns 200 with status ok (no auth required)', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // ─── Auth rejection ──────────────────────────────────────────────────

  describe('Authentication', () => {
    it('rejects requests without X-API-Key header with 401', async () => {
      const res = await request(app.getHttpServer()).get('/events');

      expect(res.status).toBe(401);
    });

    it('rejects requests with an invalid API key with 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set('X-API-Key', 'totally-bogus-key');

      expect(res.status).toBe(401);
    });
  });

  // ─── Scope enforcement ───────────────────────────────────────────────

  describe('Scope enforcement', () => {
    it('rejects events.write when key only has events.read scope (403)', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('X-API-Key', readOnlyKey)
        .send({ type: 'test.scope', payload: { foo: 'bar' } });

      expect(res.status).toBe(403);
    });

    it('rejects events.read when key has no scopes (403)', async () => {
      const res = await request(app.getHttpServer()).get('/events').set('X-API-Key', noScopeKey);

      expect(res.status).toBe(403);
    });

    it('rejects keys.manage when key only has events.read scope (403)', async () => {
      const res = await request(app.getHttpServer()).get('/api-keys').set('X-API-Key', readOnlyKey);

      expect(res.status).toBe(403);
    });
  });

  // ─── Validation ──────────────────────────────────────────────────────

  describe('Validation', () => {
    it('rejects event creation with missing type (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('X-API-Key', fullScopeKey)
        .send({ payload: { foo: 'bar' } });

      expect(res.status).toBe(400);
    });

    it('rejects event creation with missing payload (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('X-API-Key', fullScopeKey)
        .send({ type: 'test.validation' });

      expect(res.status).toBe(400);
    });

    it('rejects event creation with empty body (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('X-API-Key', fullScopeKey)
        .send({});

      expect(res.status).toBe(400);
    });

    it('rejects event creation with non-object payload (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('X-API-Key', fullScopeKey)
        .send({ type: 'test.validation', payload: 'not-an-object' });

      expect(res.status).toBe(400);
    });

    it('rejects event creation with unknown fields (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('X-API-Key', fullScopeKey)
        .send({ type: 'test.validation', payload: { a: 1 }, extraField: 'nope' });

      expect(res.status).toBe(400);
    });
  });

  // ─── Events CRUD ─────────────────────────────────────────────────────

  describe('Events CRUD', () => {
    let createdEventId: string;

    it('POST /events creates a new event', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('X-API-Key', fullScopeKey)
        .send({ type: 'test.created', payload: { message: 'hello world' } });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('ok', true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('type', 'test.created');
      expect(res.body.data).toHaveProperty('payload');
      expect(res.body.data.payload).toEqual({ message: 'hello world' });
      expect(res.body.data).toHaveProperty('status', 'pending');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data.deletedAt).toBeNull();

      createdEventId = res.body.data.id as string;
    });

    it('GET /events lists events', async () => {
      const res = await request(app.getHttpServer()).get('/events').set('X-API-Key', fullScopeKey);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ok', true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /events?type=test.created filters events by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/events?type=test.created')
        .set('X-API-Key', fullScopeKey);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ok', true);
      expect(Array.isArray(res.body.data)).toBe(true);

      for (const event of res.body.data as Array<{ type: string }>) {
        expect(event.type).toBe('test.created');
      }
    });

    it('GET /events/:id returns the event by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${createdEventId}`)
        .set('X-API-Key', fullScopeKey);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ok', true);
      expect(res.body.data).toHaveProperty('id', createdEventId);
      expect(res.body.data).toHaveProperty('type', 'test.created');
    });

    it('GET /events/:id returns 404 for non-existent event', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .get(`/events/${fakeId}`)
        .set('X-API-Key', fullScopeKey);

      expect(res.status).toBe(404);
    });

    it('DELETE /events/:id soft deletes the event', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/events/${createdEventId}`)
        .set('X-API-Key', fullScopeKey);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ok', true);
      expect(res.body).toHaveProperty('message', 'Event deleted');
      expect(res.body.data).toHaveProperty('deletedAt');
      expect(res.body.data.deletedAt).not.toBeNull();
    });

    it('GET /events excludes soft-deleted events from listing', async () => {
      const res = await request(app.getHttpServer()).get('/events').set('X-API-Key', fullScopeKey);

      expect(res.status).toBe(200);

      const ids = (res.body.data as Array<{ id: string }>).map((e) => e.id);
      expect(ids).not.toContain(createdEventId);
    });

    it('GET /events/:id returns 404 for soft-deleted event', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${createdEventId}`)
        .set('X-API-Key', fullScopeKey);

      expect(res.status).toBe(404);
    });

    it('DELETE /events/:id returns 404 for non-existent event', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .delete(`/events/${fakeId}`)
        .set('X-API-Key', fullScopeKey);

      expect(res.status).toBe(404);
    });
  });

  // ─── API Keys CRUD ───────────────────────────────────────────────────

  describe('API Keys CRUD', () => {
    let createdKeyId: string;

    it('POST /api-keys creates a new API key', async () => {
      const res = await request(app.getHttpServer())
        .post('/api-keys')
        .set('X-API-Key', fullScopeKey)
        .send({ name: 'test-created-via-api', scopes: ['events.read'] });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('ok', true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('name', 'test-created-via-api');
      expect(res.body.data).toHaveProperty('plaintext');
      expect(res.body.data.scopes).toEqual(['events.read']);
      expect(res.body.data.isActive).toBe(true);

      createdKeyId = res.body.data.id as string;
    });

    it('GET /api-keys lists all API keys', async () => {
      const res = await request(app.getHttpServer())
        .get('/api-keys')
        .set('X-API-Key', fullScopeKey);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ok', true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      // Listed keys should NOT expose the hash
      for (const key of res.body.data as Array<Record<string, unknown>>) {
        expect(key).not.toHaveProperty('keyHash');
        expect(key).not.toHaveProperty('plaintext');
      }
    });

    it('DELETE /api-keys/:id revokes an API key', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api-keys/${createdKeyId}`)
        .set('X-API-Key', fullScopeKey);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ok', true);
      expect(res.body).toHaveProperty('message', 'API key revoked');
      expect(res.body.data.isActive).toBe(false);
    });

    it('POST /api-keys rejects creation with missing name (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api-keys')
        .set('X-API-Key', fullScopeKey)
        .send({ scopes: ['events.read'] });

      expect(res.status).toBe(400);
    });
  });

  // ─── Wildcard scope ──────────────────────────────────────────────────

  describe('Wildcard scope', () => {
    let wildcardKey: string;

    beforeAll(async () => {
      wildcardKey = randomBytes(32).toString('hex');
      const hash = createHash('sha256').update(wildcardKey).digest('hex');
      await prisma.apiKey.create({
        data: {
          name: 'test-wildcard',
          keyHash: hash,
          scopes: ['*'],
          isActive: true,
        },
      });
    });

    afterAll(async () => {
      await prisma.apiKey.deleteMany({ where: { name: 'test-wildcard' } });
    });

    it('wildcard scope grants access to events.write', async () => {
      const res = await request(app.getHttpServer())
        .post('/events')
        .set('X-API-Key', wildcardKey)
        .send({ type: 'test.wildcard', payload: { scope: 'star' } });

      expect(res.status).toBe(201);
    });

    it('wildcard scope grants access to keys.manage', async () => {
      const res = await request(app.getHttpServer()).get('/api-keys').set('X-API-Key', wildcardKey);

      expect(res.status).toBe(200);
    });
  });
});
