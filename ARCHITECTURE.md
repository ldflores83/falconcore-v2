# Falcon Core V2 - Architecture

## Overview
Falcon Core V2 is a comprehensive multi-product platform built with Firebase Functions (Node.js 20) and Next.js frontends. The system supports 6+ products with shared backend infrastructure, analytics tracking, and centralized administration.

## Security Model

### OAuth Flow & Credential Management
- **Admin Authentication**: Only admin users authenticate via OAuth to access Google Drive
- **Form Submissions**: User forms have NO access to OAuth credentials
- **Credential Isolation**: Form submissions go directly to Firestore + Cloud Storage
- **Admin Processing**: Only the admin panel can sync data to Google Drive using stored OAuth credentials
- **Dynamic Admin System**: Configurable admin per product via `projectAdmins.ts`

### Flujo de Seguridad Correcto:
1. **Usuario envía formulario** → Datos van a Firestore + Cloud Storage (sin OAuth)
2. **Admin hace login** → OAuth crea carpeta específica: `producto_email@admin.com`
3. **Admin procesa submissions** → Sincroniza desde Cloud Storage a Google Drive
4. **Admin cambia estados** → Actualiza Firestore, elimina registros cuando completa

### OAuth Module Architecture
- **Early Validation**: `ENCRYPTION_KEY` validated immediately after token exchange
- **Race Condition Fix**: 100ms delay in frontend to ensure URL parameter availability
- **Session Management**: Dynamic admin sessions with `clientId` generation
- **Security**: AES-256-GCM encryption for sensitive OAuth data
- **Scalability**: Easy addition of new products with dedicated admins

## Products

### 1. OnboardingAudit
- **Frontend**: Next.js 14.2.30 with TypeScript
- **Backend**: Firebase Functions with Express.js
- **Storage**: Firestore + Cloud Storage + Google Drive (admin only)
- **Authentication**: OAuth 2.0 for admin access only
- **Status**: ✅ Production Ready

#### Security Features:
- ✅ Form submissions isolated from OAuth credentials
- ✅ Admin-only Google Drive access
- ✅ Product-specific folder creation: `onboardingaudit_luisdaniel883@gmail.com`
- ✅ Persistent folder management (no duplicates)
- ✅ Restricted OAuth scopes: `drive.file` + `userinfo.email`

#### Data Flow:
1. **Form Submission**: User data → Firestore + Cloud Storage
2. **Admin Login**: OAuth → Creates/uses existing folder
3. **Process Submissions**: Cloud Storage → Google Drive → Delete from Cloud Storage
4. **Status Management**: Firestore updates → Delete on completion

### 2. Ahau (Content Copilot)
- **Frontend**: Next.js 14.2.30 with TypeScript + Firebase Auth
- **Backend**: Firebase Functions with comprehensive API
- **Storage**: Firestore with tenant-based architecture
- **Authentication**: Firebase Authentication + Tenant-based access control
- **Status**: ✅ Milestones A, B, C, D, E Completed

#### Features:
- ✅ Multi-tenant architecture with role-based access
- ✅ Content generation with AI integration
- ✅ LinkedIn publishing capabilities
- ✅ Analytics and gamification system
- ✅ Profile management and tone customization
- ✅ Draft management and approval workflow

### 3. UayLabs (Main Landing)
- **Frontend**: Next.js 14.2.30 with i18n (ES/EN)
- **Backend**: Shared Firebase Functions
- **Features**: Multi-language support, Framer Motion animations
- **Status**: ✅ Production Ready

### 4. Ignium
- **Frontend**: Next.js 14.2.30 with waitlist functionality
- **Backend**: Shared Firebase Functions
- **Features**: Waitlist management, analytics tracking
- **Status**: ✅ Production Ready

### 5. JobPulse
- **Frontend**: Next.js 14.2.30 with job board interface
- **Backend**: Shared Firebase Functions
- **Features**: Job posting and management
- **Status**: ✅ Production Ready

### 6. PulzioHQ
- **Frontend**: Next.js 14.2.30 with business tools interface
- **Backend**: Shared Firebase Functions
- **Features**: Business management tools
- **Status**: ✅ Production Ready

### 7. LD Admin Dashboard
- **Frontend**: Next.js 14.2.30 with centralized admin interface
- **Backend**: Shared Firebase Functions
- **Features**: Global analytics, product management, waitlist administration
- **Status**: ✅ Production Ready

## Backend Architecture

### Firebase Functions Structure
```
functions/
├── src/
│   ├── api/
│   │   ├── admin/          # Admin-only endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   ├── public/         # Public form endpoints
│   │   └── ahau/           # Ahau-specific API endpoints
│   ├── oauth/              # OAuth flow management
│   ├── storage/            # Storage providers (Google Drive, etc.)
│   ├── services/           # Shared services
│   ├── middleware/         # Authentication and validation middleware
│   ├── products/           # Product-specific helpers
│   └── routes/             # Route definitions
```

### OAuth Module Structure
```
functions/src/oauth/
├── callback.ts              # Main OAuth callback handler
├── saveOAuthData.ts         # Secure OAuth data persistence
├── login.ts                 # OAuth initiation
├── check.ts                 # Session verification
├── README.md                # Comprehensive module documentation
└── providers/               # OAuth provider implementations
    ├── google.ts            # Google OAuth provider
    └── microsoft.ts         # Microsoft OAuth provider

functions/src/config/
└── projectAdmins.ts         # Dynamic admin configuration per product
```

### Key Endpoints

#### Public API (No Authentication Required)
- `POST /api/public/receiveForm` - Form submissions (NO OAuth access)
- `POST /api/public/uploadAsset` - File uploads
- `POST /api/public/getUsageStatus` - Usage statistics
- `POST /api/public/trackVisit` - Analytics tracking
- `POST /api/public/addToWaitlist` - Waitlist registration

#### Admin API (OAuth Required)
- `POST /api/admin/processSubmissions` - Admin sync to Google Drive
- `POST /api/admin/updateSubmissionStatus` - Status management
- `POST /api/admin/analytics` - Product analytics
- `POST /api/admin/waitlist` - Waitlist management

#### Auth API
- `POST /api/auth/check` - Authentication verification
- `POST /api/auth/getClientId` - Client ID generation
- `POST /api/auth/logout` - Session termination

#### Ahau API (Firebase Auth Required)
- `POST /api/ahau/session/verify` - Session verification
- `POST /api/ahau/tenants.create` - Tenant creation
- `POST /api/ahau/users.invite` - User invitation
- `GET /api/ahau/users.list` - User listing
- `POST /api/ahau/drafts.create` - Draft creation
- `GET /api/ahau/drafts.list` - Draft listing
- `POST /api/ahau/content/generate` - AI content generation
- `POST /api/ahau/publish` - LinkedIn publishing

#### OAuth Endpoints
- `GET /oauth/login` - Admin OAuth initiation
- `GET /oauth/callback` - OAuth completion
- `GET /oauth/check` - Credential verification

### Storage Providers
- **GoogleDriveProvider**: Handles Google Drive operations
- **DropboxProvider**: Future implementation
- **OneDriveProvider**: Future implementation

## Frontend Architecture

### Next.js Configuration
- **Framework**: Next.js 14.2.30
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Build**: Static export for Firebase Hosting
- **Deployment**: Firebase Hosting with custom rewrites

### Performance Optimizations
- **Code Splitting**: Lazy loading with React.lazy
- **Service Workers**: PWA capabilities
- **Web Workers**: File processing
- **Caching**: API response caching with debouncing
- **Analytics**: Client-side tracking with debouncing
- **Static Generation**: Pre-built pages for better performance

### Analytics System
- **Universal Tracking**: All frontends implement consistent analytics
- **Debounced Requests**: 1-second debounce to prevent spam
- **Caching**: 5-minute cache to avoid duplicate tracking
- **Session Management**: Unique session IDs per visit
- **Data Collected**: Page visits, user agent, screen resolution, referrer, time on page

#### Analytics Implementation
```typescript
// Shared across all frontends
class AnalyticsTracker {
  private sessionId: string;
  private projectId: string;
  private startTime: number;
  
  async trackPageVisit(page: string): Promise<void>
  async trackPageExit(): Promise<void>
  async trackCTAClick(action: string): Promise<void>
}
```

### OAuth Frontend Integration
- **Race Condition Resolution**: 100ms delay in `useEffect` to ensure URL parameter availability
- **Session Token Handling**: Dynamic extraction and cleanup from URL query parameters
- **Authentication Flow**: Comprehensive logging for debugging and monitoring
- **State Management**: Efficient `clientId` handling with React hooks

### Multi-Product Architecture
- **Shared Dependencies**: Common `node_modules` in `/frontends` directory
- **Individual Builds**: Each product has its own build process
- **Centralized Deployment**: Single Firebase hosting target with rewrites
- **Consistent Styling**: Shared Tailwind configuration

## Dependencies & Configuration

### Backend Dependencies
```json
{
  "dependencies": {
    "@google-cloud/secret-manager": "^6.1.0",
    "axios": "^1.10.0",
    "cors": "^2.8.5",
    "date-fns": "^4.1.0",
    "dotenv": "^17.2.0",
    "express": "^4.18.2",
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^6.4.0",
    "googleapis": "^133.0.0",
    "undici": "^6.21.3"
  }
}
```

### Frontend Dependencies (Shared)
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "firebase": "^12.1.0",
    "firebase-admin": "^13.4.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "next": "14.2.30",
    "react": "^18",
    "react-dom": "^18"
  }
}
```

### Firebase Configuration
- **Project ID**: `falconcore-v2`
- **Region**: `us-central1`
- **Runtime**: Node.js 20
- **Secrets**: `cloud-storage-key`, `ENCRYPTION_KEY`
- **Hosting**: Single target with multiple product rewrites

## Deployment

### Build Process
- **Frontend**: `npm run build` → Static export
- **Backend**: `npm run build` → TypeScript compilation
- **Deployment**: Firebase CLI for both hosting and functions
- **Multi-Product**: Individual builds with shared deployment

### Environment Management
- **Secrets**: Google Cloud Secret Manager
- **Configuration**: Environment variables per environment
- **OAuth**: Stored in Firestore with encryption
- **Analytics**: Real-time tracking across all products

### URL Structure
- **Main**: `https://uaylabs.web.app/`
- **Products**: 
  - `/ahau/` - Ahau Content Copilot
  - `/onboardingaudit/` - Onboarding Audit
  - `/ignium/` - Ignium Landing
  - `/jobpulse/` - JobPulse
  - `/pulziohq/` - PulzioHQ
  - `/ld/` - Admin Dashboard

## Security Best Practices

### OAuth Implementation
- **Scopes**: Minimal required permissions (`drive.file`, `userinfo.email`)
- **Token Storage**: Encrypted in Firestore
- **Session Management**: Session tokens with expiry
- **Folder Isolation**: Product-specific folders only

### Data Protection
- **Form Data**: No OAuth access, direct to storage
- **Admin Access**: OAuth required for Google Drive operations
- **Credential Isolation**: Clear separation between public and admin endpoints

## Recent Optimizations

### Code Cleanup
- ✅ Removed unnecessary debug statements
- ✅ Eliminated unused code
- ✅ Optimized imports and dependencies

### Performance Enhancements
- ✅ Implemented Web Workers for file processing
- ✅ Added API response caching
- ✅ Optimized build process
- ✅ Enhanced error handling

### Security Improvements
- ✅ Restricted OAuth scopes
- ✅ Isolated form submissions from OAuth
- ✅ Implemented persistent folder management
- ✅ Added session-based authentication

### OAuth Flow Resolution
- ✅ **Race Condition Fix**: Implemented 100ms delay to resolve component mounting vs URL parameter availability
- ✅ **Dynamic Admin System**: Replaced hardcoded admin checks with configurable `projectAdmins.ts`
- ✅ **Session Management**: Enhanced admin session creation and validation
- ✅ **Comprehensive Logging**: Added detailed frontend and backend logging for debugging
- ✅ **Error Handling**: Improved error responses and user feedback

## Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Error Handling**: Comprehensive error management

### Testing Strategy
- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full workflow validation

### Monitoring
- **Analytics**: Client-side tracking
- **Logging**: Structured logging for debugging
- **Error Tracking**: Comprehensive error reporting

## OAuth Troubleshooting

### Common Issues & Solutions

#### Race Condition (Redirect to Login)
- **Symptom**: User redirected to login after OAuth completion
- **Cause**: Frontend component mounts before URL parameters are available
- **Solution**: 100ms delay in `useEffect` ensures URL processing completion
- **Code**: ```typescript
  useEffect(() => {
    setTimeout(() => checkAuthAndLoadData(), 100);
  }, []);
  ```

#### Encryption Key Errors
- **Symptom**: "Missing or invalid ENCRYPTION_KEY" errors
- **Cause**: Environment variable not configured or invalid format
- **Solution**: Verify `ENCRYPTION_KEY` in Google Secret Manager (32-byte hex)

#### Permission Denied (Secret Manager)
- **Symptom**: `PERMISSION_DENIED: Permission 'secretmanager.versions.access' denied`
- **Cause**: Firebase Functions service account lacks Secret Manager access
- **Solution**: Grant `roles/secretmanager.secretAccessor` role to service account

### Debug Steps
1. **Frontend**: Check browser console for detailed logs
2. **Backend**: Verify Firebase Functions logs
3. **Environment**: Confirm `ENCRYPTION_KEY` configuration
4. **OAuth Flow**: Test complete authentication sequence
5. **Admin Config**: Verify `projectAdmins.ts` configuration

### Performance Notes
- **100ms Delay**: Imperceptible to users, prevents race conditions reliably
- **Alternative Solutions**: Event-driven URL processing (future enhancement)
- **Browser Compatibility**: Works across all modern browsers 