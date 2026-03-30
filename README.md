# Boilerworks NestJS Micro

> Lightweight NestJS 11 microservice with API-key auth, Prisma, Swagger,
> and Docker. No frontend, no sessions — pure TypeScript API service.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11 (Fastify adapter) |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Auth | API-key (SHA256, per-key scopes) |
| Docs | Swagger UI at `/api/docs` |
| Tests | Vitest |
| Linting | ESLint + Prettier |

## Getting Started

```bash
# Start services
docker compose up -d

# Get your seed API key (shown once on first boot)
docker compose logs api | grep "Plaintext key"

# Test it
curl http://localhost:3000/health
curl -H "X-API-Key: YOUR_KEY" http://localhost:3000/events
```

## Endpoints

| Method | Path | Auth | Scope | Description |
|--------|------|------|-------|-------------|
| GET | /health | None | - | Health check |
| GET | /api/docs | None | - | Swagger UI |
| POST | /events | API Key | events.write | Create event |
| GET | /events | API Key | events.read | List events |
| GET | /events/:id | API Key | events.read | Event detail |
| DELETE | /events/:id | API Key | events.write | Soft delete |
| POST | /api-keys | API Key | keys.manage | Create key |
| GET | /api-keys | API Key | keys.manage | List keys |
| DELETE | /api-keys/:id | API Key | keys.manage | Revoke key |

## Commands

```bash
make up        # Start Docker services
make down      # Stop services
make test      # Run tests
make lint      # Lint check
make migrate   # Run Prisma migrations
make seed      # Seed admin API key
make studio    # Open Prisma Studio
make logs      # Tail container logs
```

## Documentation

- [bootstrap.md](bootstrap.md) -- Conventions and patterns
- [CLAUDE.md](CLAUDE.md) -- Agent shim

---

Boilerworks is a [CONFLICT](https://weareconflict.com) brand. CONFLICT is a registered trademark of CONFLICT LLC.
