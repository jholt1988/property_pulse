# Migration Map: `pms-master/tenant_portal_app` → `imported/property-pulse`

## Goal
Move the tenant portal from Vite/React to the Next.js App Router codebase in `imported/property-pulse` with minimal downtime and low regression risk.

## Source / Target
- **Source:** `/data/.openclaw/workspace/pms-master/tenant_portal_app`
- **Target:** `/data/.openclaw/workspace/imported/property-pulse`

---

## 1) Proposed target structure (Next App Router)

```txt
app/
  (public)/
    login/page.tsx
    signup/page.tsx
    forgot-password/page.tsx
    reset-password/page.tsx
  (tenant)/
    dashboard/page.tsx
    maintenance/page.tsx
    payments/page.tsx
    lease/page.tsx
    inspections/page.tsx
    messages/page.tsx
    application/page.tsx
  (manager)/
    dashboard/page.tsx
    properties/page.tsx
    leases/page.tsx
    applications/page.tsx
    reporting/page.tsx
    users/page.tsx
    audit/page.tsx
  legal/
    privacy/page.tsx
    terms/page.tsx

components/
  ui/
  tenant/
  manager/
  shared/

lib/
  api/
  auth/
  services/
  types/
  constants/
  utils/
  tokens/
```

---

## 2) Route-level mapping

| Source file | Target route/file |
|---|---|
| `src/LoginPage.tsx` + `src/domains/shared/auth/features/login/LoginPage.tsx` | `app/(public)/login/page.tsx` |
| `src/SignupPage.tsx` + `src/domains/shared/auth/features/signup/SignupPage.tsx` | `app/(public)/signup/page.tsx` |
| `src/ForgotPasswordPage.tsx` | `app/(public)/forgot-password/page.tsx` |
| `src/PasswordResetPage.tsx` | `app/(public)/reset-password/page.tsx` |
| `src/MainDashboard.tsx` + `src/domains/tenant/features/dashboard/TenantDashboard.tsx` | `app/(tenant)/dashboard/page.tsx` |
| `src/MaintenanceManagementPage.tsx` + `src/domains/tenant/features/maintenance/MaintenancePage.tsx` | `app/(tenant)/maintenance/page.tsx` |
| `src/PaymentsPage.tsx` + `src/domains/tenant/features/payments/PaymentsPage.tsx` | `app/(tenant)/payments/page.tsx` |
| `src/LeaseManagementPage.tsx` + `src/domains/tenant/features/lease/MyLeasePage.tsx` | `app/(tenant)/lease/page.tsx` |
| `src/InspectionManagementPage.tsx` + `src/domains/tenant/features/inspection/*` | `app/(tenant)/inspections/page.tsx` + nested detail route |
| `src/MessagingPage.tsx` + `src/domains/shared/features/messaging/MessagingPage.tsx` | `app/(tenant)/messages/page.tsx` |
| `src/domains/tenant/features/application/ApplicationPage.tsx` | `app/(tenant)/application/page.tsx` |
| `src/PropertyManagerDashboard.tsx` | `app/(manager)/dashboard/page.tsx` |
| `src/PropertyManagementPage.tsx` | `app/(manager)/properties/page.tsx` |
| `src/LeaseManagementPageModern.tsx` | `app/(manager)/leases/page.tsx` |
| `src/RentalApplicationsManagementPage.tsx` | `app/(manager)/applications/page.tsx` |
| `src/ReportingPage.tsx` | `app/(manager)/reporting/page.tsx` |
| `src/UserManagementPage.tsx` | `app/(manager)/users/page.tsx` |
| `src/AuditLogPage.tsx` | `app/(manager)/audit/page.tsx` |
| `src/pages/legal/PrivacyPage.tsx` | `app/legal/privacy/page.tsx` |
| `src/pages/legal/TermsPage.tsx` | `app/legal/terms/page.tsx` |

---

## 3) Component migration mapping

### Shared UI primitives
- `src/components/ui/*` → `components/ui/*`
- Keep/merge with existing:
  - `components/ui/button.tsx`
  - `components/ui/card.tsx`
  - `components/ui/badge.tsx`
  - `components/ui/input.tsx`
  - `components/ui/progress-bar.tsx`

### Domain components
- `src/components/leases/*` → `components/manager/leases/*`
- `src/components/messages/*` → `components/shared/messages/*`
- `src/components/properties/*` → `components/manager/properties/*`
- `src/components/chatbot/*` + `src/components/LeasingAgentBot.tsx` → `components/shared/ai/*`

### Layout/Shell
- `src/StaffShell.tsx`, `src/TenantShell.tsx`, `src/components/ui/AppShell.tsx`, `src/components/ui/Sidebar.tsx`, `src/components/ui/Topbar.tsx` 
  → adapt into existing `components/layout/app-shell.tsx`, `components/navigation/sidebar.tsx`, `components/navigation/top-bar.tsx`

---

## 4) Services and business logic mapping

- `src/services/apiClient.ts` → `lib/api/client.ts`
- `src/services/propertySearch.ts` → `lib/services/property-search.ts`
- `src/services/EsignatureApi.ts` → `lib/services/esignature.ts`
- `src/services/AIOperatingSystemService.ts` → `lib/services/ai-operating-system.ts`
- `src/services/LeasingAgentService.ts` → `lib/services/leasing-agent.ts`
- `src/domains/shared/ai-services/**` → `lib/services/ai/**`

- `src/constants/routes.ts` → `lib/constants/routes.ts`
- `src/constants/roles.ts` → `lib/constants/roles.ts`
- `src/types/**` → `lib/types/**`
- `src/utils/**` → `lib/utils/**`
- `src/hooks/**` → `lib/hooks/**` (or `hooks/**` at root if preferred)

---

## 5) Styling/token migration

- `src/design-tokens/*` → merge into `lib/tokens.ts` + Tailwind theme (`tailwind.config.ts`)
- `src/globals.css` / `src/index.css` → consolidate into `app/globals.css`

Rule: one token source of truth (prefer Tailwind + `lib/tokens.ts`).

---

## 6) Testing migration

### Unit/Integration
- Move critical tests first:
  - `src/services/apiClient.test.ts`
  - `src/services/AIOperatingSystemService.test.ts`
  - `src/services/LeasingAgentService.test.ts`
  - critical UI behavior tests in `src/components/ui/*.test.tsx`

### E2E (Playwright)
Port top value specs from `e2e/` in order:
1. `authentication.spec.ts`
2. `dashboard.spec.ts`
3. `maintenance.spec.ts`
4. `payments.spec.ts`
5. `lease-management.spec.ts`
6. `messaging.spec.ts`

---

## 7) Execution plan (recommended order)

## Sprint 1 (foundation)
1. Set up route groups `(public)`, `(tenant)`, `(manager)`
2. Add auth/session guard layer in `lib/auth`
3. Port constants/types/api client baseline
4. Port login/signup/reset flows

## Sprint 2 (tenant core)
1. Dashboard
2. Maintenance
3. Payments
4. Lease
5. Inspections

## Sprint 3 (manager core)
1. PM dashboard + properties
2. Leases + applications
3. Reporting + users + audit

## Sprint 4 (stabilize + cutover)
1. Port remaining edge features (documents, quickbooks, scheduling, rent estimator)
2. E2E parity on critical flows
3. UAT + traffic cutover
4. Archive old app

---

## 8) Risks and controls

- **Auth divergence risk** → migrate auth first and gate every protected route.
- **UI drift risk** → normalize tokens before large component porting.
- **API contract risk** → use typed DTOs + adapters in `lib/api`.
- **Regression risk** → keep old app as fallback until smoke + UAT pass.

---

## 9) Immediate next actions (I can do next)

1. Create App Router folders and placeholder pages for all mapped routes.
2. Scaffold `lib/api/client.ts`, `lib/auth/session.ts`, `lib/constants/{routes,roles}.ts`.
3. Migrate auth pages first (`login`, `signup`, `forgot`, `reset`) with shared UI.

If you say **"continue"**, I’ll start implementing step 1 + 2 directly in `property-pulse`.
