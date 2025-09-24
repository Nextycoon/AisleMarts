# AisleMarts — All-In-One Pack
Generated: 2025-09-24 15:33

This bundle contains **working essentials** for Infinity Stories (Expo RN + Web) and Phase-3 Commerce:
- Expo RN Phase-2 implementation (virtualized rings, viewer, preload, LRU cache)
- Web test pack (Cypress)
- Backend (Express + Prisma) with cursor stories, tracking, purchases
- Hardening samples (Idempotency + HMAC) and k6 load tests
- Railway CORS check script

## Quickstart (Local)
1) **Backend**
```bash
cd backend
cp ../.env.example .env   # set DATABASE_URL (Postgres)
pnpm i || npm i
pnpm prisma migrate deploy || npx prisma migrate deploy
node scripts/seed.mjs
node src/server.js
# -> http://localhost:3000
```

2) **Web tests**
```bash
npx http-server client-web -p 5500 &
pnpm cypress run --config-file tests/web/cypress.config.ts || npx cypress run --config-file tests/web/cypress.config.ts
```

3) **Expo RN**
- Copy `expo/src/` into your Expo app and render `<InfinityStoriesScreen />`.
- Set `EXPO_PUBLIC_API_URL=https://<your>.up.railway.app` (or local HTTPS).
- Run your app; TestIDs align with Detox if you add it later.

4) **Railway sanity**
```bash
bash scripts/check_railway.sh https://<your>.up.railway.app
```

## Notes
- This is a compact delivery designed to unblock you. Ask if you want a fully expanded repo structure.
