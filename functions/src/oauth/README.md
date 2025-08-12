# OAuth Module Documentation

## Overview
The OAuth module handles Google OAuth 2.0 authentication for the Onboarding Audit system, providing secure access to Google Drive and user authentication.

## Architecture Components

### 1. OAuth Flow Components

#### `callback.ts` - Main OAuth Callback Handler
- **Purpose**: Processes the OAuth callback after user authorization
- **Key Features**:
  - Early `ENCRYPTION_KEY` validation before any Drive operations
  - Secure token exchange and storage
  - Google Drive folder creation/management
  - Admin session creation and redirection

#### `saveOAuthData.ts` - OAuth Data Persistence
- **Purpose**: Securely stores encrypted OAuth tokens in Firestore
- **Security**: Uses AES-256-GCM encryption with `ENCRYPTION_KEY`

#### `encryption.ts` - Cryptographic Operations
- **Purpose**: Handles encryption/decryption of sensitive OAuth data
- **Algorithm**: AES-256-GCM with 32-byte hex key

### 2. Authentication & Session Management

#### `check.ts` - Session Verification
- **Purpose**: Validates admin sessions and permissions
- **Features**:
  - Dynamic project admin verification
  - Session token validation
  - `clientId` generation and management

#### `projectAdmins.ts` - Admin Configuration
- **Purpose**: Centralized project admin management
- **Structure**: Maps project IDs to admin email addresses
- **Scalability**: Easy to add new products with dedicated admins

## OAuth Flow Sequence

### 1. User Initiation
```
User → /login → Google OAuth → Google Authorization
```

### 2. OAuth Callback Processing
```
Google Callback → callback.ts → ENCRYPTION_KEY Validation → Token Exchange
```

### 3. Post-Authentication
```
Token Storage → Drive Folder Creation → Admin Session → Dashboard Redirect
```

## Security Features

### 1. Encryption Key Validation
- **Timing**: Validated immediately after token exchange
- **Validation**: Ensures 32-byte hex string format
- **Failure Handling**: Aborts flow without Drive side-effects

### 2. Token Security
- **Storage**: Encrypted in Google Secret Manager
- **Transmission**: HTTPS-only communication
- **Access**: Limited to authorized admin users

### 3. Admin Authorization
- **Dynamic**: Configurable per project
- **Single Admin**: One admin per product (configurable)
- **Session-based**: Temporary authentication tokens

## Frontend Integration

### 1. Race Condition Resolution
- **Problem**: Component mounting before URL parameters available
- **Solution**: 100ms delay in `useEffect` to ensure URL processing
- **Impact**: Prevents premature redirect to login

### 2. Session Token Handling
- **Extraction**: From URL query parameters
- **Cleanup**: URL sanitization after token extraction
- **Validation**: Backend verification before dashboard access

### 3. Authentication Flow
```typescript
// Frontend authentication sequence
useEffect(() => {
  // 100ms delay to ensure URL is processed
  setTimeout(() => {
    checkAuthAndLoadData();
  }, 100);
}, []);
```

## Configuration

### 1. Environment Variables
```bash
ENCRYPTION_KEY=32_byte_hex_string
GOOGLE_CLIENT_ID=oauth_client_id
GOOGLE_CLIENT_SECRET=oauth_client_secret
```

### 2. Project Admin Configuration
```typescript
// functions/src/config/projectAdmins.ts
export const PROJECT_ADMINS: Record<string, string> = {
  'onboardingaudit': 'luisdaniel883@gmail.com',
  'jobpulse': 'luisdaniel883@gmail.com',
  'pulziohq': 'luisdaniel883@gmail.com',
  'ignium': 'luisdaniel883@gmail.com',
};
```

### 3. OAuth Scopes
- `drive.file`: Access to files created by the app
- `userinfo.email`: User email for identification

## Error Handling

### 1. Encryption Key Issues
- **Detection**: Early validation in callback
- **Response**: Clear error message and flow abortion
- **Logging**: Detailed error information for debugging

### 2. Authentication Failures
- **Frontend**: Redirect to login page
- **Backend**: Proper error responses with status codes
- **User Experience**: Clear feedback on authentication issues

### 3. Network Failures
- **Retry Logic**: Frontend handles temporary failures
- **Fallback**: Graceful degradation to login

## Performance Considerations

### 1. Delay Optimization
- **Current**: 100ms delay for URL processing
- **Impact**: Imperceptible to users
- **Benefit**: Prevents race conditions reliably

### 2. Caching Strategy
- **Session Tokens**: Stored in component state
- **Admin Data**: Cached after successful authentication
- **Submissions**: Loaded on-demand with caching

## Monitoring & Debugging

### 1. Frontend Logs
```typescript
// Comprehensive logging for debugging
console.log('🔍 Frontend: checkAuthAndLoadData STARTED');
console.log('🔍 Frontend: Extracted sessionToken:', sessionToken);
console.log('🔍 Frontend: Making auth request with body:', requestBody);
```

### 2. Backend Logs
```typescript
// OAuth callback logging
console.log('🔄 OAuth Callback: Creating admin session for:', email, projectId);
console.log('✅ OAuth Callback: Admin session created with token:', sessionToken);
```

### 3. Error Tracking
- **Frontend**: Console errors and user feedback
- **Backend**: Structured error logging
- **Monitoring**: Firebase Functions logs

## Future Enhancements

### 1. Multi-User Support
- **Current**: Single admin per product
- **Future**: Multiple admins with role-based permissions
- **Implementation**: Extend `projectAdmins.ts` structure

### 2. Enhanced Security
- **Current**: Basic session management
- **Future**: JWT tokens, refresh tokens, MFA
- **Implementation**: Token rotation and enhanced validation

### 3. Performance Improvements
- **Current**: 100ms delay workaround
- **Future**: Event-driven URL processing
- **Implementation**: URL change listeners and hooks

## Troubleshooting

### 1. Common Issues

#### Race Condition (Redirect to Login)
- **Symptom**: User redirected to login after OAuth
- **Cause**: Component mounts before URL parameters available
- **Solution**: Ensure 100ms delay in `useEffect`

#### Encryption Key Errors
- **Symptom**: "Missing or invalid ENCRYPTION_KEY" errors
- **Cause**: Environment variable not set or invalid format
- **Solution**: Verify `ENCRYPTION_KEY` in Google Secret Manager

#### Permission Denied Errors
- **Symptom**: Secret Manager access denied
- **Cause**: IAM permissions not configured
- **Solution**: Grant `secretmanager.secretAccessor` role to service account

### 2. Debug Steps
1. Check browser console for frontend logs
2. Verify Firebase Functions logs
3. Confirm environment variables
4. Test OAuth flow step by step
5. Verify admin configuration

## API Endpoints

### 1. OAuth Endpoints
- `POST /api/oauth/callback`: OAuth callback processing
- `GET /api/oauth/login`: OAuth initiation

### 2. Authentication Endpoints
- `POST /api/auth/check`: Session verification
- `POST /api/auth/logout`: Session termination
- `POST /api/auth/getClientId`: Client ID generation

### 3. Admin Endpoints
- `POST /api/admin/submissions`: Load admin data
- `POST /api/admin/updateSubmissionStatus`: Update submission status
- `POST /api/admin/processSubmissions`: Process pending submissions

## Dependencies

### 1. Backend Dependencies
- `firebase-admin`: Firebase integration
- `googleapis`: Google Drive API
- `crypto`: Encryption operations

### 2. Frontend Dependencies
- `next/router`: Navigation and routing
- `react`: Component framework
- `fetch`: API communication

## Security Checklist

- [ ] `ENCRYPTION_KEY` properly configured
- [ ] HTTPS-only communication
- [ ] OAuth scopes limited to necessary permissions
- [ ] Admin access properly restricted
- [ ] Session tokens properly validated
- [ ] Error messages don't leak sensitive information
- [ ] Logging doesn't expose sensitive data
- [ ] Proper CORS configuration
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints

## Conclusion

The OAuth module provides a secure, scalable authentication solution for the Onboarding Audit system. The 100ms delay workaround effectively resolves race conditions while maintaining excellent user experience. The system is designed for easy expansion to additional products and enhanced security features.
