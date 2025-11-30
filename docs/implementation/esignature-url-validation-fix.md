# E-Signature URL Validation Fix

## Issue

**Error**: `WARN [EsignatureService] Failed to fetch recipient view URL, falling back. Error: TypeError: Invalid URL`

## Root Cause

The `ESIGN_PROVIDER_BASE_URL` environment variable was either:
1. Not set (undefined)
2. Set to an invalid URL format
3. Empty string

When axios tried to create a request with an invalid or undefined baseURL, it threw a "TypeError: Invalid URL" error.

## Solution

### 1. URL Validation
Added `isValidUrl()` helper method to validate URLs before using them:
```typescript
private isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
```

### 2. Constructor Improvements
- Validate baseURL before creating axios instance
- Create dummy client if baseURL is invalid (for graceful fallback)
- Log warning when provider is not configured

### 3. Enhanced `requestRecipientView` Method
- Check if baseURL is configured before making request
- Validate returnUrl before using it
- Better error messages
- Graceful fallback to local URL

### 4. Return URL Validation
Added `validateReturnUrl()` method to:
- Validate absolute URLs
- Convert relative paths to absolute URLs
- Provide safe fallback URLs

### 5. Improved Error Handling
- All httpClient requests now check for valid baseURL first
- Better error messages with actual error details
- Graceful fallbacks in all methods

## Files Modified

- `tenant_portal_backend/src/esignature/esignature.service.ts`
  - Added `isValidUrl()` method
  - Added `validateReturnUrl()` method
  - Enhanced constructor with URL validation
  - Improved `requestRecipientView()` method
  - Enhanced `dispatchProviderEnvelope()` method
  - Enhanced `refreshEnvelopeStatus()` method
  - Enhanced `voidEnvelope()` method

## Behavior Changes

### Before
- Axios would throw "Invalid URL" error
- Error would be caught and logged as warning
- Fallback URL would be used (but might also be invalid)

### After
- URL is validated before creating axios instance
- If invalid, uses mock/fallback mode immediately
- Return URLs are validated and sanitized
- Better error messages for debugging
- Graceful degradation when provider not configured

## Configuration

Make sure to set a valid URL in your `.env` file:

```env
# Valid examples:
ESIGN_PROVIDER_BASE_URL=https://api.docusign.com/restapi/v2.1
ESIGN_PROVIDER_BASE_URL=https://api.hellosign.com/v3

# Also recommended:
FRONTEND_URL=http://localhost:3000  # For return URL validation
```

## Testing

1. **Without Provider URL**:
   - System should use mock/fallback mode
   - No "Invalid URL" errors
   - Envelopes can still be created (with mock IDs)

2. **With Invalid Provider URL**:
   - System should detect invalid URL
   - Should use fallback mode
   - Should log warning

3. **With Valid Provider URL**:
   - System should make actual API calls
   - Should work normally

## Status: ✅ Fixed

The invalid URL error has been resolved. The system now:
- Validates URLs before use
- Gracefully handles missing/invalid configuration
- Provides better error messages
- Falls back to mock mode when needed

