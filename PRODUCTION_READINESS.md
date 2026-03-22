# Property Pulse — Production Readiness Checklist

## 1) Environment & Config

- [ ] Set `NEXT_PUBLIC_API_BASE_URL` in deployment environment.
- [ ] Confirm frontend and API use matching environments (staging vs prod).
- [ ] Ensure HTTPS is enabled for both app and API.
- [ ] Verify CORS allows app origin.

## 2) Auth & Session

- [ ] Confirm login returns a token with role claim (`TENANT`, `PROPERTY_MANAGER`, `ADMIN`).
- [ ] Verify role routing after login:
  - Tenant -> `/tenant/dashboard`
  - Manager/Admin -> `/manager/dashboard`
- [ ] Verify role guards block cross-role access.
- [ ] Replace client-set cookie auth with secure server-issued HttpOnly cookies if required by security policy.

## 3) API Endpoint Wiring (must return valid payloads)

### Auth
- `POST /auth/login`
- `GET /auth/password-policy`
- `POST /auth/register`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### Tenant
- `GET /tenant/dashboard`
- `GET/POST /maintenance`
- `GET /payments/invoices`
- `GET /payments/history`
- `GET /payments/payment-methods`
- `GET /leases/my-lease`
- `POST /leases/{id}/tenant-notices`
- `GET /messaging/conversations`
- `GET /messaging/conversations/{id}/messages`
- `POST /messaging/messages`
- `GET /inspections`
- `GET /inspections/{id}`
- `GET/POST /inspections/requests`
- `POST /inspections/start`
- `PATCH /inspections/rooms/{roomId}/items`
- `POST /inspections/items/{itemId}/photos`
- `PATCH /inspections/{id}/status`
- `GET /properties/public`
- `POST /rental-applications`

### Manager
- `GET /dashboard/metrics`
- `GET /properties`
- `GET /leases`
- `GET /rental-applications`
- `GET /reporting/{reportType}`
- `GET/POST/PUT/DELETE /users`
- `GET /security-events`

## 4) UX & Functional Smoke Tests

- [ ] Auth flows: login, signup, forgot/reset password.
- [ ] Tenant flows: dashboard, maintenance submit/list, payments, lease notice, inspections list/detail, messages send.
- [ ] Manager flows: dashboard, properties, leases, applications, reporting, users CRUD, audit logs.
- [ ] Logout clears session and returns to login.
- [ ] Sidebar route highlighting works across nested routes.

## 5) Security Hardening

- [ ] Do not store long-lived auth tokens in readable JS cookies for production.
- [ ] Add CSRF protection if cookie-based auth is used.
- [ ] Ensure backend validates role/ownership on every protected endpoint.
- [ ] Add rate limiting on auth and messaging endpoints.
- [ ] Confirm sensitive fields are redacted in audit/export logs.

## 6) Deployment & Operations

- [ ] Build passes in CI (`npm run build`).
- [ ] Add basic CI pipeline (build + lint + smoke tests).
- [ ] Add uptime/health monitoring for web + API.
- [ ] Add error tracking (e.g., Sentry) for frontend.
- [ ] Add rollback plan for releases.

## 7) Immediate status in this repo

- ✅ Migration to Next.js App Router completed.
- ✅ Auth + tenant + manager route wiring implemented.
- ✅ Legal pages implemented.
- ✅ Production build currently passing.
- ⚠️ Final production launch still depends on backend contract validation and security hardening choices.
