# AisleMarts — Pilot Monitoring Kit (MongoDB, Kenya-Ready)
**Generated:** 2025-09-15T16:25:11.457882Z

Three **pre-wired dashboards** for Day-1 pilot ops:
1) **Orders Overview** — totals, status mix, AOV, 30d trend
2) **M-Pesa STK Health** — success rate, failures, latency, KES volume + trend
3) **Commission Tracker (1%)** — gross, commission, net, orders, AOV

## Quick Start
```bash
cd deployment
cp .env.example .env
# edit Mongo URL if needed
./deploy.sh
# Web:  http://localhost:3000
# API:  http://localhost:8000/health
```

## Mongo & Collections
Defaults match Phases 1/2 (`orders`, `seller_products`, `users`, `order_events`, `payments`).  
Override via `.env` only if needed.

## Data Assumptions
- **orders**: `status`, `total` (KES), `createdAt: Date`
- **payments** (optional): `resultCode` (0=success), `amount` (KES), `createdAt: Date`, `latencyMs`

## Extend
- Add API in `backend/admin_metrics_api.py`
- Add a card to `frontend/src/pages/index.js`
- Commit & deploy
