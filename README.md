# Keyring OS Starter

[![Property Pulse CI](https://github.com/jholt1988/property_pulse/actions/workflows/ci.yml/badge.svg)](https://github.com/jholt1988/property_pulse/actions/workflows/ci.yml)

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

## pms-master integration (default local setup)

`.env.example` is preconfigured for local `pms-master` integration:

- `NEXT_PUBLIC_API_BASE_URL=/api/backend`
- `BACKEND_API_ORIGIN=http://127.0.0.1:3001`

Start backend + UI (one command):

```bash
cd /data/.openclaw/workspace/imported/property-pulse
npm run dev:with-pms
```

Optional stop command:

```bash
npm run pms:stop
```

Manual (two-terminal) option:

```bash
# terminal 1 (pms backend)
cd /data/.openclaw/workspace/pms-master
docker compose up -d postgres redis mil backend

# terminal 2 (property pulse)
cd /data/.openclaw/workspace/imported/property-pulse
npm run dev
```

## Environment

Set:

- `NEXT_PUBLIC_API_BASE_URL` (required for API-connected pages)
- `BACKEND_API_ORIGIN` (recommended for local/server proxying to backend)

### Hooking up to `pms-master/tenant_portal_backend`

Recommended setup (avoids CORS/localhost browser issues):

```env
NEXT_PUBLIC_API_BASE_URL=/api/backend
BACKEND_API_ORIGIN=http://127.0.0.1:3001
```

Then run both apps:

```bash
# terminal 1
cd /data/.openclaw/workspace/pms-master/tenant_portal_backend
npm run start:dev

# terminal 2
cd /data/.openclaw/workspace/imported/property-pulse
npm run dev
```

`property_pulse` will call `/api/backend/*`, and Next.js will proxy to backend `http://127.0.0.1:3001/api/*`.

## Production readiness

See `PRODUCTION_READINESS.md` for launch checklist and endpoint matrix.

## Design system

- `DESIGN_SYSTEM.md` — implementation rules, component architecture, and authoring checklist
- `TOKEN_CONTRACT.json` — machine-readable design token contract

## Recommended next moves

1. Connect domain data models to your PMS backend
2. Replace placeholders with live charts
3. Add auth, RBAC, and command palette behavior
4. Extend `components/domain/` with inspection, leasing, and finance-specific blocks
5. Add charts, forms, and data fetching
