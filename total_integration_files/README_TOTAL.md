# AisleMarts — Total Integration Pack
Generated: 2025-09-24 14:40

This pack **does it all**: DB seed (Prisma + raw SQL), CI workflow, Docker for backend,
Railway/CORS checks, Expo/Web envs, and "run-all" scripts for local smoke.

## What you can do immediately
- Seed Postgres with **12 creators**, **16 products**, **40+ stories**, and affiliate contracts
- Spin up backend (Express + Prisma), then run Cypress + LHCI against the web sample
- Verify Railway health/CORS with a single script
- Use Makefile shortcuts for common flows

## Quickstart
```bash
# 1) Backend env (local)
cp .env.example .env                    # edit DATABASE_URL
# 2) Seed DB (Prisma)
pnpm i --prefix backend
pnpm prisma migrate deploy --prefix backend
node backend/scripts/seed.mjs
# 3) Run backend
pnpm dev --prefix backend
# 4) Web sample + Cypress + Lighthouse
npx http-server client-web -p 5500
pnpm cypress run --prefix tests/web --config-file tests/web/cypress.config.ts
pnpm lhci autorun --prefix tests/web --config=tests/web/lighthouse/lighthouserc.json
# 5) Check Railway URL (replace)
bash scripts/check_railway.sh https://<your>.up.railway.app
```

See `Makefile` for shortcuts (install, seed, run, test).
