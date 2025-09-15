# AisleMarts — Kenya Pilot Frontend Test Pack

**Generated:** 2025-09-15T15:02:01.363056Z

Plug-and-run **Jest + React Native Testing Library** tests focused on Kenya pilot specifics,
plus backend API smoke requests.

## Includes
- `jest.config.js`, `tests/setup.ts` — test rig
- Component/Screen tests:
  - `StoreProfileEditor.test.tsx` — +254 phone, key fields render
  - `CommissionPanel.test.tsx` — 1% commission presence
  - `ProductEditor.test.tsx` — variant add workflow
  - `SellerDashboard.test.tsx` — KPI tiles + list
- `tests/utils/format.ts` — KES formatter and phone validator helpers
- `api_smoke/backend_smoke.http` — REST Client smoke for Phase 1 endpoints

## How to run
```bash
# Install testing deps
npm i -D jest @testing-library/react-native @testing-library/jest-native react-test-renderer

# Run tests
npx jest
```

## Notes
- Align imports to your actual app paths if different.
- Extend tests to verify KES formatting and M-Pesa flows once endpoints are wired.
- For E2E, consider adding **Detox** later to exercise full flows on device.
