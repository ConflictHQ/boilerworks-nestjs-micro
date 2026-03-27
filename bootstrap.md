# Boilerworks NestJS Micro -- Bootstrap

> NestJS 11 microservice with Fastify adapter, API-key authentication,
> Prisma ORM, and Swagger documentation. No frontend, no sessions —
> pure API service.

## Architecture

```
Caller (service, cron, webhook sender)
  |
  v (HTTP + X-API-Key header)
  |
NestJS 11 (Fastify)
  |-- Prisma 6 (Postgres 16)
  +-- Swagger UI at /api/docs
```

## Conventions

### Auth
- All endpoints require `X-API-Key` header except `/health`
- Keys are SHA256-hashed before storage — plaintext never stored
- Per-key scopes: `events.read`, `events.write`, `keys.manage`, `*`
- `@UseGuards(ApiKeyGuard)` on every controller
- `@RequireScope('scope.name')` for scope-specific endpoints

### Models
- UUID primary keys (`@id @default(uuid())`)
- `@@map("snake_case")` for table names
- Audit fields: `createdAt`, `updatedAt`
- Soft deletes: `deletedAt` field, PrismaService filters automatically

### API
- All responses wrapped in `ApiResponse<T>`: `{ ok, data, message, errors }`
- class-validator DTOs on all inputs
- Swagger decorators on all controllers
- Rate limiting: 10 requests per 60 seconds (configurable via env)

### Testing
- Vitest integration tests with real Postgres
- Test with API key headers
- Both valid and invalid auth cases

### Docker
- `docker compose up -d` starts API + Postgres
- Auto-runs migrations + seed on startup
- Seed creates admin key with `['*']` scopes (logged to stdout once)

### Seed API Key
On first boot, check container logs for the plaintext key:
```bash
docker compose logs api | grep "Plaintext key"
```
