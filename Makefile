.PHONY: up down build test lint migrate seed studio logs

up:
	docker compose up -d --build

down:
	docker compose down

build:
	pnpm run build

test:
	pnpm run test

lint:
	pnpm run lint

migrate:
	pnpm exec prisma migrate dev

seed:
	pnpm run prisma:seed

studio:
	pnpm exec prisma studio

logs:
	docker compose logs -f
