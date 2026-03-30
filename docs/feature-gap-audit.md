# Property Pulse Feature Gap Audit

Date: 2026-03-30
Scope: `imported/property-pulse` frontend compared against `pms-master/tenant_portal_backend` API surface.

## Summary

`property-pulse` has a solid base for:
- auth/session flows
- tenant dashboard + maintenance + payments
- manager dashboard/reporting/properties/users/applications basics

But backend capability is much broader. Largest gaps are in billing ops, rent optimization workflows, e-signature, QuickBooks, document center, and scheduling.

## Gap Matrix

### Implemented (good baseline)
- Auth: login/signup/forgot/reset + role-gated layouts
- Tenant: dashboard, maintenance, payments, lease, inspections, messages
- Manager: dashboard, reporting, properties, leases, applications, users, audit
- Proxy auth forwarding for `/api/backend/*` with httpOnly cookie token

### Partial
- Messaging: basic flows present, admin/bulk/reporting controls missing
- Inspections: tenant flows present, manager review/decision/estimate workflows not fully surfaced
- Maintenance: tenant request flow present, manager technician/asset/SLA tooling missing

### Missing (high-value)
1. Billing operations
   - Endpoints exist for autopay, connected accounts, fee versions, plan cycles, pricing snapshots, run billing
   - Missing manager UI + workflow orchestration

2. Rent optimization
   - Endpoint suite exists for recommendation generation/review/apply
   - No manager UI in property-pulse

3. E-signature
   - Full envelope lifecycle endpoints exist
   - No frontend flows for create/view/resend/void/download docs

4. QuickBooks
   - Auth + sync endpoints exist
   - No admin integration UI/status panel

5. Documents
   - Upload/list/share/download/delete endpoints exist
   - No dedicated document center in frontend

6. Scheduling/calendar
   - `schedule/*` endpoints exist
   - No schedule dashboard in frontend

7. Notifications center
   - Notifications + preferences APIs exist
   - No inbox/preferences UI

## Prioritized Build Plan

## Phase 1 (started in this pass)
- Add manager **Billing Ops** page (connected account + autopay + plan cycles + snapshots)
- Add manager **Rent Optimization** page (stats + pending/recent + generate)

## Phase 2
- Add manager **QuickBooks** integration page
- Add manager **Documents** center (list/upload/download/share)
- Add manager **Schedule** page (today/week/month/expirations)

## Phase 3
- Add manager **E-signature** operations for lease envelopes
- Add advanced **Messaging admin** and **Bulk campaigns** UI
- Add manager-side inspection review/estimate workflow screens

## Risks / Notes
- Several backend endpoints are role-sensitive; UI must enforce manager/admin gating and show actionable 403/401 states.
- Keep API calls server-proxied through `/api/backend/*` to preserve httpOnly cookie auth.
- A few pages still include debug logs in app tree (`debug.log` files) and should be cleaned in hardening pass.

## Immediate Next Steps
1. Land Phase 1 pages with functional API wiring.
2. Validate with live tenant+manager accounts.
3. Add integration tests for new manager pages.
