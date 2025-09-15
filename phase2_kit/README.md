# AisleMarts Phase 2 — Order Management Kit

**Generated:** 2025-09-15T15:13:14.275803Z

This kit adds the **seller order lifecycle**, an **M-Pesa STK webhook stub**, and a **buyer "My Orders"** screen to extend the Kenya pilot.

## Frontend (React Native)
- `SellerOrders.tsx` — seller list with statuses
- `SellerOrderDetail.tsx` — totals, timeline, and actions (mark shipped/delivered)
- `BuyerMyOrders.tsx` — buyer-facing order history
- All totals shown in **KES** for Kenya pilot

## Backend (FastAPI)
- `routers/orders.py` — list/get/update status (`pending → paid → shipped → delivered/cancelled`)
- `routers/mpesa_webhook.py` — `/mpesa/stk/callback` stub; map success to `paid`
- `app.py` — router mounts + `/health`

## Postman
- `api/postman_collection.json` for instant testing

## Wiring Guide
1. Map your **CheckoutRequestID ↔ orderId** in DB on STK initiation.
2. In `/mpesa/stk/callback`, when `ResultCode == 0`, set order status to `paid` and persist transaction id/amount (for audits).
3. Emit notifications (email/SMS/push) on transitions: `paid`, `shipped`, `delivered`.
4. Secure endpoints with your JWT and seller scoping.
5. Mirror seller updates into Buyer **My Orders**.

## Next Steps
- Add delivery provider integration hooks (optional).
- Add timeline events persistence for audit trail.
- Add web admin override for disputes/cancellations.

Enjoy Phase 2! 🚀
