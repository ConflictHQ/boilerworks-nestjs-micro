# Calliope — Boilerworks NestJS Micro
<!-- Agent shim for https://github.com/calliopeai/calliope-cli -->

Primary conventions doc: [`bootstrap.md`](bootstrap.md)
Context seed: [`memory.md`](memory.md)

Read both before writing any code.

---

## Project-specific notes

- NestJS 11 (Fastify adapter) API-only microservice; Prisma 6 on Postgres 16; Swagger UI at `/api/docs`. No frontend, no sessions.
- API-key auth (`X-API-Key`, SHA256-hashed) on all endpoints except `/health`; `@UseGuards(ApiKeyGuard)` on every controller, `@RequireScope('scope.name')` for scoped endpoints; scopes `events.read`, `events.write`, `keys.manage`, `*`.
- UUID primary keys (`@id @default(uuid())`), `@@map("snake_case")` table names; soft deletes via `deletedAt` (PrismaService filters automatically).
- All responses wrapped in `ApiResponse<T>` `{ok, data, message, errors}`; class-validator DTOs and Swagger decorators on all inputs/controllers; rate limit 10 requests / 60s.
- Vitest integration tests run against real Postgres, covering both valid and invalid auth cases.
- Make targets: `make up`, `make migrate`, `make seed`, `make studio`, `make test`, `make lint`.
