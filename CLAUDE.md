# Claude -- Boilerworks NestJS Micro

Primary conventions doc: [`bootstrap.md`](bootstrap.md)

Read it before writing any code.

## Stack

- **Backend**: NestJS 11 (Fastify adapter)
- **Frontend**: None (API-only microservice)
- **API**: REST with Swagger at `/api/docs`
- **ORM**: Prisma 6 (PostgreSQL 16)
- **Auth**: API-key (SHA256 hashed, per-key scopes)

## Quick Reference

| Endpoint | URL |
|----------|-----|
| Health | http://localhost:3000/health |
| Swagger | http://localhost:3000/api/docs |
| Events | http://localhost:3000/events |
| API Keys | http://localhost:3000/api-keys |

## Commands

```bash
make up        # Start Docker services
make down      # Stop services
make test      # Run Vitest
make lint      # ESLint + Prettier check
make migrate   # Run Prisma migrations
make seed      # Seed admin API key
make studio    # Open Prisma Studio
make logs      # Tail container logs
```

## Structure

```
src/
  auth/         # ApiKeyGuard, ScopeGuard, decorators
  api-key/      # API key CRUD (controller, service, DTOs)
  event/        # Event CRUD with soft deletes
  health/       # Health check endpoint
  prisma/       # PrismaService (global)
  common/       # ApiResponse DTO, interceptors
  main.ts       # Fastify bootstrap + Swagger
  app.module.ts # Root module
```

## Rules

- API-key auth on all endpoints except /health
- UUID primary keys, never expose internal IDs
- Soft deletes on business models (deletedAt field)
- Scopes: `events.read`, `events.write`, `keys.manage`, `*` (wildcard)
- class-validator DTOs on all inputs
- Swagger decorators on all controllers
