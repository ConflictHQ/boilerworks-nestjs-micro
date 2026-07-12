# Boilerworks NestJS Micro — Memory

AI context seed for the Boilerworks NestJS microservice template. Captures decisions, constraints, and non-obvious facts that are not derivable from reading the code.

For conventions and patterns, see [`bootstrap.md`](bootstrap.md).

---

## Platform purpose

API-only NestJS 11 microservice template (Fastify adapter). No frontend, no sessions — API-key auth with per-key scopes, Prisma 6 on PostgreSQL 16, Swagger at `/api/docs`. Part of the Boilerworks family — each edition is a ground-up build for its stack, sharing architectural principles but not code.

---

## Key architectural decisions

| Decision | Why |
|---|---|
| Fastify adapter (not Express) | Faster HTTP layer for a pure API service; Swagger served via `@fastify/*` plugins |
| API-key auth (no Auth0, no sessions) | Service-to-service callers; keys are SHA256-hashed before storage, plaintext never stored |
| Per-key scopes (`events.read`, `events.write`, `keys.manage`, `*`) | Least-privilege access per caller; enforced by `ApiKeyGuard` + `@RequireScope` |
| UUID primary keys | Never expose sequential IDs |
| Soft deletes via `deletedAt` | PrismaService filters automatically; never hard-delete business objects |
| Vitest (not Jest) | Faster runs; integration tests hit a real Postgres |
| `ApiResponse<T>` envelope on all responses | Uniform `{ ok, data, message, errors }` contract for callers |

---

## Things that bite newcomers

- **The seed admin key is printed to stdout exactly once** — `docker compose logs api | grep "Plaintext key"`; it cannot be recovered afterwards.
- **`@UseGuards(ApiKeyGuard)` on every controller** except health — the framework does not enforce this automatically.
- **Rate limiting is hardcoded** (10 req / 60 s in `src/app.module.ts`), not env-configurable.
- **NodeNext ESM-style imports** — internal imports use `.js` extensions (`./prisma/prisma.module.js`).
- **Regenerate the Prisma client** after schema changes (`pnpm prisma:generate`) — CI does this before linting.
- **Tests need real Postgres** — `make up` (or CI's service container) before `make test`.

---

## Infrastructure topology

```
┌───────────────────────────────────────┐
│  Docker Compose                       │
│                                       │
│  api (NestJS/Fastify) ──► postgres    │
│                                       │
│  auto-migrate + seed on startup       │
└───────────────────────────────────────┘
```

`./run.sh up` / `make up` starts everything. Host Postgres access uses the port published by docker-compose (5432).

---

## Sibling reference

`boilerworks-nestjs-nextjs` (full-stack TS) and `boilerworks-django-nextjs` share the architectural principles (soft deletes, no raw IDs, bootstrap.md as source of truth). This edition strips them down to a minimal service: no GraphQL, no RBAC groups, no queues.
