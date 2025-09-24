install:
	pnpm i --prefix backend

migrate:
	pnpm prisma migrate deploy --prefix backend

seed: migrate
	node backend/scripts/seed.mjs

backend:
	pnpm dev --prefix backend

web:
	npx http-server client-web -p 5500

cypress:
	pnpm cypress run --prefix tests/web --config-file tests/web/cypress.config.ts

lhci:
	pnpm lhci autorun --prefix tests/web --config=tests/web/lighthouse/lighthouserc.json

run-all: backend web cypress lhci
