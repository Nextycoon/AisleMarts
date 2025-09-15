# AisleMarts Multi-Vendor Starter Kit

This kit adds **seller dashboards, orders, and analytics** to your AI-first foundation.

## Includes
- `src/screens/SellerDashboard.tsx` — KPIs + product list + quick actions
- `src/screens/ProductEditor.tsx` — create/edit product
- `src/screens/Orders.tsx` & `OrderDetail.tsx` — seller order management
- `src/screens/Analytics.tsx` — KPI tiles + timeseries placeholder
- `src/components/ProductListItem.tsx`, `StatTile.tsx` — reusable UI
- `api/openapi.yaml` — endpoints for products, orders, analytics
- `mocks/sample.json` — seed data
- `tests/*.test.ts` — test skeletons

## Wire-up Notes
1. Add routes/tabs for **Dashboard, Products, Orders, Analytics** in your seller app shell.
2. Connect screens to backend endpoints listed in `api/openapi.yaml`.
3. Use M-Pesa webhooks to transition orders `pending -> paid`.
4. Persist product `active` flag to control AI suggestions surfacing.
5. Expose analytics timeseries for `revenue, orders, views, ctr, ai_share`.

Generated: 2025-09-15T03:32:04.820451Z
