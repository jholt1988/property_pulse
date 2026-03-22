# Keyring OS Starter

A production-minded **Next.js + Tailwind** starter for **Keyring OS — The Operating System for Real Estate**.

## Included

- App Router structure
- Dark-mode control-plane dashboard shell
- Shared design tokens
- Core UI primitives
- Sidebar + top bar
- Metric cards
- Property data table
- AI insight cards
- Approval queue rows
- Starter module routes:
  - Dashboard
  - Inspect
  - Lease
  - Finance
  - AI
  - Tenants
  - Properties

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Environment

Set:

- `NEXT_PUBLIC_API_BASE_URL` (required for API-connected pages)

## Production readiness

See `PRODUCTION_READINESS.md` for launch checklist and endpoint matrix.

## Recommended next moves

1. Connect domain data models to your PMS backend
2. Replace placeholders with live charts
3. Add auth, RBAC, and command palette behavior
4. Extend `components/domain/` with inspection, leasing, and finance-specific blocks
5. Add charts, forms, and data fetching
