# Property Pulse Go-Live Runbook

## T-15 min

- Confirm frontend + backend CI checks are green.
- Confirm env vars in target environment:
  - `NEXT_PUBLIC_API_BASE_URL`
  - backend DB/Redis/JWT secrets

## Deploy order

1. Deploy backend
2. Run backend quick check:
   - `npm run verify:integration` (or equivalent deployed check)
3. Deploy frontend
4. Run frontend checks:
   - app loads `/login`
   - tenant and manager route access behavior

## First 30 minutes checks

- Login (tenant, manager/admin)
- Tenant flow:
  - dashboard, maintenance, payments, lease, inspections
- Manager flow:
  - dashboard, properties, leases, users, applications
- Verify no burst of 401/403/500 in logs

## Incident response quick actions

- If auth/session issues:
  - validate JWT secret + cookie domain/path/secure settings
- If API data empty/failing:
  - verify backend connectivity and migrations
- If frontend route guards misbehave:
  - clear session cookies and re-authenticate

## Rollback plan

- Revert frontend deployment to previous stable tag
- Revert backend deployment to previous stable tag
- Re-run health checks before re-opening traffic
