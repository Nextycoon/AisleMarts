# AisleMarts — Final Readiness Patch
Generated: 2025-09-24 16:55

Fixes final blockers:
1) Analytics funnel integrity (sessionized materialized views)
2) Proper 4xx responses (validation + error handler)
3) Multi-currency EUR/GBP/JPY (validation, rounding, FX)

## Apply
psql "$DATABASE_URL" -f sql/01_funnel_views.sql
psql "$DATABASE_URL" -f sql/02_fx_seed.sql
psql "$DATABASE_URL" -f sql/03_indexes.sql

# Server & middleware
# Copy backend/src/* files into your backend/src and replace your server entry with server.patched.js
# Then run your server.
