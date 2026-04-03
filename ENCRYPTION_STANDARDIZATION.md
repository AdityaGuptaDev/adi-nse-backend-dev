# Encryption Standardization Implementation

## Overview
This document outlines the standardized encryption/decryption implementation across the entire application to resolve PII (Personally Identifiable Information) encryption issues and ensure consistent handling of encrypted data.

## Problem Solved
The application was experiencing decryption failures due to:
1. **URL-encoded characters** in encrypted data (`#x2F` for `/`, `#x2B` for `+`, `#x3D` for `=`)
2. **Inconsistent encryption/decryption logic** across different services
3. **Mixed encryption formats** (CryptoJS salted vs regular AES)
4. **Environment configuration issues** causing wrong crypto keys to be used

## Solution Implemented

### 1. Centralized Encryption Utility
**File**: `src/utils/standardEncryption.ts`

This utility provides:
- `standardDecrypt()` - Handles all decryption scenarios including URL-encoded characters
- `standardEncrypt()` - Consistent encryption using CryptoJS
- `decryptPIIField()` - PII-specific decryption with field validation
- `decryptPIIFields()` - Batch decryption for multiple PII fields
- `encodeForTransmission()` - URL-encode special characters for safe transmission
- `decodeFromTransmission()` - Decode URL-encoded characters

### 2. Updated Components

#### PII Middleware (`src/middlewares/piiDecrypt.middleware.ts`)
- Now uses the centralized `decryptPIIFields()` function
- Handles URL-encoded characters automatically
- Maintains backward compatibility

#### Encryption Service (`src/services/encryptDecrypt-service.ts`)
- `encryptData()` now uses `standardEncrypt()`
- `decryptData()` now uses `standardDecrypt()`
- Maintains same API for existing code

#### Test Endpoint (`src/routes/user/user-api.ts`)
- Added `/test-pii-decryption` endpoint for debugging
- Uses standardized utility for testing

### 3. Environment Configuration Fix
**File**: `src/environment.ts`
- Changed default environment from `production` to `development`
- Ensures correct database and crypto key configuration

## Features of the Standardized Solution

### URL Encoding Handling
The system automatically handles these URL-encoded patterns:
- `#x2F` → `/` (forward slash)
- `#x2B` → `+` (plus sign)
- `#x3D` → `=` (equals sign)
- Handles both uppercase and lowercase variants

### CryptoJS Salted Format Support
- Detects CryptoJS salted format (starts with `U2FsdGVkX1`)
- Properly decrypts salted encrypted data
- Falls back to regular AES decryption if needed

### Error Handling
- Graceful fallback to original value if decryption fails
- Detailed logging for debugging purposes
- Never blocks requests due to decryption failures

### Backward Compatibility
- All existing encryption/decryption calls continue to work
- No breaking changes to existing APIs
- Maintains same function signatures

## Usage Examples

### Direct Usage
```typescript
import { standardDecrypt, standardEncrypt } from '../utils/standardEncryption';

// Decrypt PII data
const decryptedUsername = standardDecrypt(encryptedUsername);

// Encrypt response data
const encryptedResponse = standardEncrypt(responseData);
```

### PII Middleware (Automatic)
The PII middleware automatically decrypts these fields when `__pii_encrypted: true` is present:
- `userName`, `username`
- `email`, `email_address`, `email_id`
- `mobile`, `mobile_number`, `mobile_no`, `phone`, `phone_number`
- `pan`, `pan_no`
- `aadhaar`, `aadhaar_no`, `aadhaar_number`, `aadhar`, `aadhar_no`, `aadhar_number`
- `password`
- `account_number`, `bank_account_number`, `accountNumber`
- `ifsc`, `ifsc_code`
- `dob`, `date_of_birth`

## Testing

### Test Endpoint
Send POST request to `/user/test-pii-decryption` with:
```json
{
  "userName": "U2FsdGVkX1#x2FYitpzb5yz4pQI7OlInHkV7vyQ2Yn1jbVzpWliQrBDSqAuQN#x2FP4y+e",
  "__pii_encrypted": true
}
```

### Expected Behavior
1. URL-encoded characters are automatically decoded
2. CryptoJS salted format is properly handled
3. Decrypted username is returned in logs
4. No more "undefined errorrrrr" messages

## Files Modified

1. **Created**: `src/utils/standardEncryption.ts` - Centralized encryption utility
2. **Updated**: `src/middlewares/piiDecrypt.middleware.ts` - Uses standardized utility
3. **Updated**: `src/services/encryptDecrypt-service.ts` - Uses standardized functions
4. **Updated**: `src/routes/user/user-api.ts` - Added test endpoint and error handling
5. **Updated**: `src/environment.ts` - Fixed default environment
6. **Updated**: `src/routes/other/other-api.ts` - Better error handling

## Benefits

1. **Consistency**: All encryption/decryption uses the same logic
2. **Reliability**: Handles all edge cases and malformed data
3. **Maintainability**: Centralized logic makes updates easier
4. **Debugging**: Comprehensive logging for troubleshooting
5. **Compatibility**: Works with existing frontend encryption
6. **Future-proof**: Easy to extend with new encryption schemes

## Deployment Notes

1. **Restart the server** to pick up the environment change
2. **Test the `/user/test-pii-decryption` endpoint** first
3. **Monitor logs** for decryption process details
4. **All existing endpoints** should now handle encrypted data properly

This implementation resolves the original encryption issues and provides a robust, standardized approach for handling PII encryption across the entire application.
