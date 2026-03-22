# Property Pulse Security Hardening

## Completed in this pass

- Added server-managed session endpoints:
  - `POST /api/auth/session` sets cookies
  - `POST /api/auth/logout` clears cookies
- `session_token` is now set as **HttpOnly** cookie by server route.
- Added `middleware.ts` route protection for:
  - public auth/legal paths
  - tenant route role gate
  - manager route role gate
- Login flow now exchanges backend token into server session cookie.
- Topbar logout now clears session through server route.
- Added JWT role extraction with signature verification support (`jsonwebtoken`) in `lib/auth/cookies.ts`.
  - When `JWT_SECRET` is set, role extraction is cryptographically verified.
  - In production without `JWT_SECRET`, role extraction fails closed.

## Remaining recommended hardening

1. Verify JWT signature server-side (currently role extraction decodes token payload only).
2. Add refresh-token/session-rotation policy.
3. Add CSRF protections for state-changing internal API routes if needed.
4. Add stricter `sameSite`/`secure` policy in full HTTPS production.
5. Add security headers policy (CSP, HSTS, frame-ancestors) via Next config/middleware.
6. Add login rate-limit and account lockout UX handling in frontend.

## Validation checklist

- [ ] unauthenticated users are redirected to `/login`
- [ ] manager cannot access `/tenant/*` unless admin
- [ ] tenant cannot access `/manager/*` unless admin
- [ ] logout clears both session cookies and blocks protected routes
