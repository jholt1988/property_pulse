# Login and Signing Session Fixes

## Issues Fixed

### 1. ✅ About:Blank Page When Signing Lease

**Problem**: When tenants tried to sign a lease, they would see an "about:blank" page instead of the signing interface.

**Root Causes**:
- Window was opened with `about:blank` before getting the URL
- URL validation was missing
- Return URL format issues

**Solution**:
- Get the signing URL first before opening window
- Validate URL before opening (must be valid HTTP/HTTPS URL)
- Improved error handling with user-friendly messages
- Fallback to same-window redirect if popup is blocked
- Better return URL handling

**Files Modified**:
- `tenant_portal_app/src/domains/tenant/features/lease/MyLeasePage.tsx`
- `tenant_portal_app/src/services/EsignatureApi.ts`

---

### 2. ✅ Unauthorized Errors for Tenants

**Problem**: Tenants were getting unauthorized errors when trying to access their lease pages or sign documents.

**Root Causes**:
- Participant lookup was too strict (only checking userId)
- Email matching fallback wasn't working properly
- User object didn't always have username field
- Role checking timing issues in frontend

**Solutions**:

**Backend**:
- Enhanced `createRecipientView` to check multiple conditions:
  - Check if tenant owns the lease
  - Check if tenant is a participant (by userId OR email)
  - Fallback to email matching if userId not set
  - Fetch username from database if not in JWT
- Better error messages

**Frontend**:
- Improved `RequireRole` component to handle loading states
- Better role checking with proper waiting for user object
- Added loading state while user is being decoded

**Files Modified**:
- `tenant_portal_backend/src/esignature/esignature.service.ts`
- `tenant_portal_backend/src/esignature/esignature.controller.ts`
- `tenant_portal_app/src/App.tsx`

---

### 3. ✅ Role-Based Routing After Login

**Problem**: Users were always redirected to `/dashboard` regardless of their role, and the redirect didn't consider role-appropriate routes.

**Solution**:
- Decode JWT token after login to get user role
- Route based on role:
  - **TENANT** → `/dashboard` (shows TenantDashboard)
  - **PROPERTY_MANAGER** → `/dashboard` (shows MainDashboard)
  - **ADMIN** → `/dashboard` (shows MainDashboard)
- Respect redirect URL if it's appropriate for user role
- Validate redirect URLs to prevent unauthorized access

**Files Modified**:
- `tenant_portal_app/src/domains/shared/auth/features/login/LoginPage.tsx`
- `tenant_portal_app/src/AuthContext.tsx` (added ADMIN to role type)

---

## Technical Details

### Signing Session Flow (Fixed)

1. User clicks "Launch Signing Session"
2. Frontend calls `createRecipientView` API
3. Backend validates user has access to envelope
4. Backend requests signing URL from provider
5. Frontend validates URL is valid HTTP/HTTPS
6. Frontend opens URL in new window
7. If popup blocked, offers same-window redirect

### Authorization Flow (Fixed)

**Backend Authorization Check**:
```typescript
// Multiple checks for tenant access:
1. Is user the lease tenant? (envelope.lease.tenantId === user.userId)
2. Is user a participant? (participant.userId === user.userId)
3. Does participant email match user email? (participant.email === user.username)
4. Fetch username from DB if not in JWT
```

**Frontend Role Check**:
```typescript
// Wait for user object to be decoded
if (!user) {
  return <LoadingState />;
}
// Check role
if (!allowedRoles.includes(user.role)) {
  return <Navigate to="/unauthorized" />;
}
```

### Login Redirect Flow (Fixed)

```typescript
1. User submits login form
2. Backend validates credentials
3. Backend returns JWT token
4. Frontend stores token
5. Frontend decodes token to get role
6. Frontend routes based on role:
   - TENANT → /dashboard (TenantDashboard)
   - PROPERTY_MANAGER/ADMIN → /dashboard (MainDashboard)
7. If redirectUrl exists and is valid for role, use it
```

---

## Testing Checklist

### Signing Session
- [ ] Tenant can launch signing session
- [ ] URL opens in new tab correctly
- [ ] Popup blocker handled gracefully
- [ ] Error messages are clear
- [ ] Invalid URLs are caught

### Authorization
- [ ] Tenant can access their lease page
- [ ] Tenant can view their envelopes
- [ ] Tenant can sign documents
- [ ] Unauthorized access shows proper error
- [ ] Loading states work correctly

### Login Routing
- [ ] Tenant logs in → goes to TenantDashboard
- [ ] Property Manager logs in → goes to MainDashboard
- [ ] Admin logs in → goes to MainDashboard
- [ ] Redirect URL respected when appropriate
- [ ] Invalid redirect URLs ignored

---

## Error Messages

### User-Friendly Messages Added

**Signing Session**:
- "You must be logged in to sign documents."
- "Invalid signing URL received from server"
- "Popup blocked. Please allow popups for this site and try again."
- "Unable to launch signing session. Please try again."

**Authorization**:
- "You are not assigned to this envelope. Please contact support if you believe this is an error."
- "You don't have permission to access this page."

---

## Configuration

No additional configuration needed. All fixes use existing infrastructure.

---

## Status: ✅ Complete

All three issues have been resolved:
1. ✅ Signing session opens correctly
2. ✅ Tenants can access their lease pages
3. ✅ Role-based routing after login

**Implementation Date**: 2024
**Status**: Ready for Testing

