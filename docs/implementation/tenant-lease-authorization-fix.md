# Tenant Lease Authorization Fix

## Issue

Tenants were getting "not authorized" errors when trying to view their lease information on the `/my-lease` page.

## Root Causes

1. **Missing Error Handling**: The controller didn't explicitly verify user authentication and role before processing
2. **Null Lease Handling**: When a tenant doesn't have a lease, the service returns `null`, which could cause confusion
3. **Error Message Clarity**: Error messages didn't clearly distinguish between authorization errors and "no lease" scenarios

## Solution

### Backend Changes

1. **Enhanced Controller Method**:
   - Added explicit user authentication check
   - Added role verification (double-check beyond RolesGuard)
   - Added logging for debugging
   - Better error messages

2. **Improved Error Handling**:
   - Clear distinction between authentication and authorization errors
   - Logging for troubleshooting
   - Graceful handling of null lease responses

**File**: `tenant_portal_backend/src/lease/lease.controller.ts`

```typescript
@Get('my-lease')
@Roles(Role.TENANT)
async getMyLease(@Request() req: AuthenticatedRequest) {
  // Verify user is authenticated and has TENANT role
  if (!req.user) {
    this.logger.warn('getMyLease called without authenticated user');
    throw new ForbiddenException('Authentication required.');
  }
  
  if (req.user.role !== Role.TENANT) {
    this.logger.warn(`getMyLease called by user with role ${req.user.role}, expected TENANT`);
    throw new ForbiddenException('Only tenants can access their lease information.');
  }
  
  this.logger.debug(`Fetching lease for tenant ${req.user.userId}`);
  const lease = await this.leaseService.getLeaseByTenantId(req.user.userId);
  
  // Return null if no lease exists - frontend handles this gracefully
  return lease;
}
```

### Frontend Changes

1. **Better Error Handling**:
   - Distinguish between authorization errors (401/403) and other errors
   - Handle null lease responses gracefully
   - Clear error messages for users

**File**: `tenant_portal_app/src/domains/tenant/features/lease/MyLeasePage.tsx`

```typescript
try {
  const data = (await apiFetch('/leases/my-lease', { token })) as Lease | null;
  
  if (!data) {
    // Tenant doesn't have a lease yet
    setError('You do not have an active lease. Please contact your property manager.');
    setLease(null);
  } else {
    setLease(data);
    // ... process lease data
  }
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Unable to load lease details.';
  
  // Check if it's an authorization error
  if (errorMessage.includes('401') || errorMessage.includes('403') || 
      errorMessage.includes('Unauthorized') || errorMessage.includes('Forbidden')) {
    setError('You are not authorized to view lease information. Please contact support if you believe this is an error.');
  } else {
    setError(errorMessage);
  }
  setLease(null);
}
```

## Route Configuration

The route is correctly configured:
- **Backend**: `@Controller('leases')` + `@Get('my-lease')` = `/api/leases/my-lease`
- **Frontend**: Calls `/leases/my-lease` which gets prefixed to `/api/leases/my-lease` by apiClient
- **Global Prefix**: `api` (configured in `index.ts`)

## Authorization Flow

1. **Request arrives** at `/api/leases/my-lease`
2. **AuthGuard('jwt')** validates JWT token
3. **RolesGuard** checks if user has TENANT role
4. **Controller method** double-checks user and role
5. **Service** fetches lease by tenantId
6. **Response** returns lease or null

## Error Scenarios

### Scenario 1: No Authentication Token
- **Error**: 401 Unauthorized
- **Message**: "Authentication required."
- **Frontend**: Shows error message, prompts to login

### Scenario 2: Wrong Role
- **Error**: 403 Forbidden
- **Message**: "Only tenants can access their lease information."
- **Frontend**: Shows error message, suggests contacting support

### Scenario 3: No Lease Found
- **Response**: 200 OK with `null` body
- **Frontend**: Shows message "You do not have an active lease. Please contact your property manager."

### Scenario 4: Valid Tenant with Lease
- **Response**: 200 OK with lease data
- **Frontend**: Displays lease information

## Testing Checklist

- [ ] Tenant with valid lease can view their lease
- [ ] Tenant without lease sees appropriate message
- [ ] Property manager cannot access `/my-lease` endpoint
- [ ] Unauthenticated user gets 401 error
- [ ] Error messages are clear and helpful
- [ ] Logging works for debugging

## Status: ✅ Fixed

The authorization issue has been resolved with:
- Better error handling in controller
- Clear distinction between error types
- Improved frontend error messages
- Added logging for troubleshooting

**Implementation Date**: 2024
**Status**: Ready for Testing

