# Property Pulse Release Checklist

Date: 2026-03-23 (Asia/Kuala_Lumpur)

Current head: `9ed4c52`

## 1) Build & test status

- ✅ `npm run build` — PASS
- ✅ `npm run test:smoke` — PASS (2/2)

## 2) Security status

- ✅ Server-managed session routes in place (`/api/auth/session`, `/api/auth/logout`)
- ✅ Middleware auth + role gates enabled
- ✅ Security headers enabled via middleware (CSP, HSTS prod, XFO, etc.)
- ⚠️ Build warning from JWT lib in edge middleware import trace (non-blocking, track for cleanup)

## 3) Env requirements

- `NEXT_PUBLIC_API_BASE_URL` must point to the target backend API
- Production requires `JWT_SECRET` set in runtime for strict JWT verification path

## 4) Functional readiness

- ✅ Public, tenant, manager route coverage in smoke tests
- ✅ Data-driven module pages implemented for AI/Finance/Inspect/Lease/Properties/Tenants
- ✅ Design system token baseline + docs shipped

## 5) Release steps

1. Confirm CI passing for latest commit.
2. Deploy backend.
3. Deploy frontend.
4. Run post-deploy checks (see `GO_LIVE_RUNBOOK.md`).
5. Tag release in git.

## 6) Rollback signal

Rollback immediately if any of the following occur:

- Login failures > 2%
- Repeated 5xx on `/api/auth/*`, `/api/leases*`, `/api/maintenance*`
- Smoke path headings/pages fail to render
