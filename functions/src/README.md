# FalconCore Functions - Technical Snapshot

## 📋 **Overview**

Firebase Functions backend para el sistema FalconCore, específicamente configurado para el módulo `onboardingaudit`. El sistema maneja formularios de auditoría de onboarding, carga de archivos, y está preparado para integración con Google Drive via OAuth.

## 🏗️ **Architecture**

### **Core Structure**
```
src/
├── api/
│   └── public/
│       ├── receiveForm.ts      # Endpoint principal para formularios
│       ├── uploadAsset.ts      # Carga de archivos
│       ├── getUsageStatus.ts   # Estadísticas de uso
│       ├── generateDocument.ts # Generación de documentos
│       └── manualAuth.ts       # Setup manual de OAuth (temporalmente deshabilitado)
├── oauth/
│   ├── setupManualAuth.ts      # Configuración manual de OAuth
│   ├── getOAuthCredentials.ts  # Obtención de credenciales OAuth
│   ├── login.ts               # Login OAuth
│   ├── callback.ts            # Callback OAuth
│   └── index.ts              # Router OAuth
├── storage/
│   ├── interfaces/
│   │   └── StorageProvider.ts # Interface para providers de storage
│   ├── providers/
│   │   ├── GoogleDriveProvider.ts # Provider para Google Drive
│   │   ├── DropboxProvider.ts     # Provider para Dropbox (placeholder)
│   │   └── OneDriveProvider.ts    # Provider para OneDrive (placeholder)
│   └── utils/
│       └── providerFactory.ts     # Factory para crear providers
└── app.ts                        # Configuración principal de Express
```

## 🔧 **Current Status**

### **✅ Working Components**
- **Form Submission**: Endpoint `/api/public/receiveForm` funcional
- **File Upload**: Endpoint `/api/public/uploadAsset` funcional
- **Usage Stats**: Endpoint `/api/public/getUsageStatus` funcional
- **Health Check**: Endpoint `/ping` funcional
- **Logging**: Sistema de logs detallado implementado

### **⚠️ Temporarily Disabled**
- **Google Drive Integration**: Comentado temporalmente por problemas de credenciales
- **OAuth Setup**: Endpoint `manualAuth` deshabilitado por problemas de inicialización
- **Firestore Integration**: Comentado temporalmente por problemas de credenciales

### **📝 Current Data Flow**
```
Frontend Form → receiveForm.ts → Console Logs
File Upload → uploadAsset.ts → Console Logs
Usage Request → getUsageStatus.ts → Mock Data
```

## 🚀 **Deployment Status**

- **Function Name**: `api`
- **Runtime**: Node.js 20 (2nd Gen)
- **Memory**: 256Mi
- **Region**: us-central1
- **Status**: ✅ Active
- **URL**: https://us-central1-falconcore-v2.cloudfunctions.net/api

## 📊 **API Endpoints**

### **POST /api/public/receiveForm**
- **Purpose**: Recibir formularios de onboarding audit
- **Status**: ✅ Working (logs only)
- **Payload**: `{ formData: OnboardingAuditForm, projectId?: string, clientId?: string }`
- **Response**: `{ success: boolean, submissionId?: string, message: string }`

### **POST /api/public/uploadAsset**
- **Purpose**: Subir archivos adicionales
- **Status**: ✅ Working (logs only)
- **Payload**: `{ submissionId: string, files: Array<FileData> }`
- **Response**: `{ success: boolean, fileIds: string[], message: string }`

### **POST /api/public/getUsageStatus**
- **Purpose**: Obtener estadísticas de uso
- **Status**: ✅ Working (mock data)
- **Payload**: `{ projectId?: string }`
- **Response**: `{ success: boolean, filesUploaded: number, mbUsed: number, resetIn: string }`

### **POST /api/public/generateDocument**
- **Purpose**: Generar documentos desde templates
- **Status**: 🔄 Implemented (not tested)
- **Payload**: `{ submissionId: string, templateType: string, data: Record<string, any> }`

### **GET /ping**
- **Purpose**: Health check
- **Status**: ✅ Working
- **Response**: `{ message: 'pong', timestamp: string }`

## 🔐 **Authentication & Storage**

### **OAuth Configuration (Prepared)**
- **Provider**: Google Drive
- **Scopes**: Drive, Documents, Presentations
- **Storage**: Firestore (`oauth_credentials` collection)
- **User ID**: `onboardingaudit_user` (fixed)

### **Storage Providers (Prepared)**
- **GoogleDriveProvider**: Implementado con OAuth
- **DropboxProvider**: Placeholder
- **OneDriveProvider**: Placeholder

## 📝 **Data Models**

### **OnboardingAuditForm**
```typescript
interface OnboardingAuditForm {
  // Section 1 - Product Basics
  productName: string;
  productUrl: string;
  targetUser: string;
  
  // Section 2 - Current Onboarding Flow
  signupMethod: string;
  signupMethodOther?: string;
  firstTimeExperience: string;
  firstTimeExperienceOther?: string;
  trackDropoff: string;
  
  // Section 3 - Goal & Metrics
  mainGoal: string;
  knowChurnRate: string;
  churnTiming: string;
  specificConcerns?: string;
  
  // Section 4 - Delivery
  email: string;
  preferredFormat: 'Google Doc' | 'Google Slides';
}
```

### **OAuthCredentials**
```typescript
interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  scope?: string;
  tokenType?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔄 **Next Steps**

### **Phase 1: OAuth Setup**
1. **Configure Environment Variables**:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`

2. **Enable manualAuth Endpoint**:
   - Uncomment in `app.ts`
   - Test OAuth flow

3. **Test OAuth Flow**:
   - Call `manualAuth` with `action: 'setup'`
   - Follow authorization URL
   - Call `manualAuth` with `action: 'complete'` and code
   - Test with `action: 'test'`

### **Phase 2: Google Drive Integration**
1. **Enable GoogleDriveProvider** in `receiveForm.ts`
2. **Test folder creation** and file upload
3. **Implement document generation** from templates

### **Phase 3: Production Features**
1. **Error handling** and retry logic
2. **Rate limiting** and usage quotas
3. **Monitoring** and alerting
4. **Documentation** and API docs

## 🛠️ **Development Commands**

```bash
# Build functions
npm run build

# Deploy functions
firebase deploy --only functions

# View logs
firebase functions:log --only api

# List functions
firebase functions:list
```

## 📊 **Recent Activity**

### **Latest Form Submission**
- **Submission ID**: `submission_1753994447163_sf9pw7g2d`
- **Product**: tetetetet
- **Email**: luisdaniel1983@hotmail.com
- **Files**: 3 files (318KB + 324KB + 1.4MB)
- **Status**: ✅ Successfully logged

### **Deployment History**
- **Last Deploy**: 2025-07-31T20:38:55
- **Function Hash**: `fbe17ca25b008a17c688c04a6c4882ab645ffe67`
- **Revision**: `api-00079-qiw`

## 🔍 **Troubleshooting**

### **Common Issues**
1. **Timeout during deploy**: Comment out complex imports temporarily
2. **OAuth credential errors**: Use logs-only mode as fallback
3. **Firestore connection issues**: Implement lazy initialization

### **Debug Commands**
```bash
# Test health check
curl https://us-central1-falconcore-v2.cloudfunctions.net/api/ping

# Test form submission
curl -X POST https://us-central1-falconcore-v2.cloudfunctions.net/api/api/public/receiveForm \
  -H "Content-Type: application/json" \
  -d '{"formData":{"email":"test@example.com","productName":"Test"}}'
```

---

**Last Updated**: 2025-07-31T20:40:47  
**Status**: ✅ Operational (logs mode)  
**Next Milestone**: OAuth Configuration 