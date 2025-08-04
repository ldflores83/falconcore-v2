# OAuth Flow Documentation - OnboardingAudit

## 📋 Estado Actual (ACTUALIZADO)

### ✅ FUNCIONANDO CORRECTAMENTE:
- ✅ **OAuth Login**: Funciona con credenciales hardcodeadas
- ✅ **OAuth Callback**: Se ejecuta correctamente y crea carpeta en Drive
- ✅ **Estructura de carpetas**: Crea `OnboardingAudit_luisdaniel883@gmail.com` (simplificada)
- ✅ **Redirección**: Después del login redirige automáticamente al dashboard
- ✅ **Dashboard**: Carga correctamente las submissions (corregido `userId`)
- ✅ **Autenticación**: Las credenciales se guardan en Firestore correctamente
- ✅ **Función `api`**: Desplegada y funcionando en `https://api-fu54nvsqfa-uc.a.run.app`

### ⚠️ WORKAROUND TEMPORAL:
- **Secret Manager**: No se puede acceder desde Firebase Functions
- **Credenciales**: Hardcodeadas en `functions/src/config.ts` como fallback
- **URLs directas**: Frontend usa URLs directas de la función para evitar rewrites

### ❌ PENDIENTE DE IMPLEMENTAR:
1. **Creación de carpetas por formulario** - Dentro de la carpeta principal
2. **Generación de documentos** - Google Docs con respuestas del formulario
3. **Subida de imágenes** - Adjuntar imágenes a la carpeta del formulario
4. **Arreglar Secret Manager** - Migrar de credenciales hardcodeadas a Secret Manager

## 🔄 Flujo OAuth Actual (FUNCIONANDO)

### 1. Inicio del Flujo (Frontend → Backend)
```
Usuario → https://uaylabs.web.app/onboardingaudit/login
Frontend → https://api-fu54nvsqfa-uc.a.run.app/api/oauth/login (URL directa)
Función api → Genera URL de Google OAuth con credenciales hardcodeadas
```

### 2. Autenticación con Google
```
Google OAuth → https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback
Función api → Procesa callback, crea carpeta simple en Drive
Callback → Redirige automáticamente a https://uaylabs.web.app/onboardingaudit/admin
```

### 3. Dashboard y Administración
```
Dashboard → https://uaylabs.web.app/onboardingaudit/admin
Frontend → https://api-fu54nvsqfa-uc.a.run.app/api/admin/submissions (URL directa)
Función api → Carga submissions desde Firestore
```

## 📁 Archivos Actualizados

### Frontend (Next.js) - URLs Directas
```
frontends/onboardingaudit/pages/login.tsx
├── handleOAuthLogin()
│   └── window.location.href = `https://api-fu54nvsqfa-uc.a.run.app/api/oauth/login?project_id=onboardingaudit&t=${timestamp}`
└── checkAuth()
    └── fetch('https://api-fu54nvsqfa-uc.a.run.app/api/auth/check')

frontends/onboardingaudit/pages/admin.tsx
├── checkAuthAndLoadData()
│   ├── fetch('https://api-fu54nvsqfa-uc.a.run.app/api/auth/check')
│   └── fetch('https://api-fu54nvsqfa-uc.a.run.app/api/admin/submissions')
└── handleLogout()
    └── fetch('https://api-fu54nvsqfa-uc.a.run.app/api/auth/logout')

frontends/onboardingaudit/components/AnalyticsDashboard.tsx
└── loadAnalytics()
    └── fetch('https://api-fu54nvsqfa-uc.a.run.app/api/admin/analytics')
```

### Backend (Firebase Functions) - Configuración Actual

#### Configuración Principal
```
functions/src/index.ts
├── export const api = onRequest({ region: "us-central1" }, app)
└── export const onboardingauditApi = onRequest({ region: "us-central1" }, async (req, res) => { ... })

functions/src/app.ts
├── app.use('/api/oauth', oauthRouter)
├── app.get('/oauth/callback', async (req, res) => { ... }) // Endpoint directo
├── app.use('/api/auth', authRouter)
└── app.use('/api/admin', adminRouter)
```

#### OAuth Router (Funcionando)
```
functions/src/oauth/index.ts
├── router.get('/login', (req, res) => login(req, res))
├── router.post('/check', check)
└── router.post('/logout', logout)
// NOTA: /callback se maneja directamente en app.ts

functions/src/oauth/login.ts
├── getOAuthConfig() // Obtiene credenciales hardcodeadas
├── oauth2Client.generateAuthUrl() // Genera URL de Google OAuth
└── res.redirect(authUrl) // Redirige a Google

functions/src/oauth/callback.ts
├── oauth2Client.getToken(code) // Intercambia code por tokens
├── provider.createFolderWithTokens() // Crea carpeta simple en Drive
├── saveOAuthData() // Guarda datos en Firestore
└── res.redirect(dashboardUrl) // Redirige al dashboard
```

#### Configuración de Credenciales (WORKAROUND)
```
functions/src/config.ts
├── getOAuthConfig() // Centraliza configuración OAuth
├── getOAuthSecrets() // Intenta Secret Manager (falla)
└── Fallback a credenciales hardcodeadas:
    {
      clientId: '1038906476883-6o30selbiuqetptejps1lnk04o1nl08d.apps.googleusercontent.com',
      clientSecret: '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',
      redirectUri: 'https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback'
    }

functions/src/services/secretManager.ts
├── getOAuthSecrets() // Accede a Secret Manager (no funciona en producción)
└── Fallback a process.env si Secret Manager falla
```

### Storage Provider (Simplificado)
```
functions/src/storage/providers/GoogleDriveProvider.ts
├── createFolderWithTokens() // Crea carpeta simple: ProjectName_Email
├── createFolder() // Método legacy (mantenido para compatibilidad)
└── findOrCreateFolder() // Busca o crea carpeta en Drive

// ESTRUCTURA SIMPLIFICADA:
// Antes: FalconCore/onboardingaudit_2025/luisdaniel883_gmail_com/
// Ahora: OnboardingAudit_luisdaniel883@gmail.com (directamente en raíz)
```

## 🔧 Configuración Actual

### URLs Funcionando:
- **OAuth Login**: `https://api-fu54nvsqfa-uc.a.run.app/api/oauth/login`
- **OAuth Callback**: `https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback`
- **Auth Check**: `https://api-fu54nvsqfa-uc.a.run.app/api/auth/check`
- **Admin Submissions**: `https://api-fu54nvsqfa-uc.a.run.app/api/admin/submissions`
- **Admin Analytics**: `https://api-fu54nvsqfa-uc.a.run.app/api/admin/analytics`
- **Auth Logout**: `https://api-fu54nvsqfa-uc.a.run.app/api/auth/logout`
- **Dashboard**: `https://uaylabs.web.app/onboardingaudit/admin`

### Credenciales OAuth (WORKAROUND):
- **Client ID**: `1038906476883-6o30selbiuqetptejps1lnk04o1nl08d.apps.googleusercontent.com`
- **Client Secret**: `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`
- **Redirect URI**: `https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback`

## ✅ Problemas Resueltos

### 1. ✅ Frontend OAuth Error
```
ANTES: Cannot GET /onboardingaudit/api/oauth/login
SOLUCIÓN: Usar URL directa de la función
AHORA: https://api-fu54nvsqfa-uc.a.run.app/api/oauth/login
```

### 2. ✅ OAuth Callback Error
```
ANTES: Cannot GET /oauth/callback
SOLUCIÓN: Endpoint directo en app.ts
AHORA: Funciona correctamente y redirige al dashboard
```

### 3. ✅ Dashboard Error
```
ANTES: "Error loading submissions data"
SOLUCIÓN: Agregar userId faltante en request
AHORA: Carga submissions correctamente
```

### 4. ✅ Estructura de Carpetas Compleja
```
ANTES: FalconCore/onboardingaudit_2025/luisdaniel883_gmail_com/
SOLUCIÓN: Simplificar a carpeta única
AHORA: OnboardingAudit_luisdaniel883@gmail.com
```

## 🚨 Problemas Pendientes

### 1. ❌ Secret Manager (BAJA PRIORIDAD)
```
Problema: No se puede acceder desde Firebase Functions
Causa: Posibles problemas de permisos IAM o configuración
Impacto: Credenciales hardcodeadas (funciona pero no es ideal)
```

### 2. ❌ Flujo de Formularios (ALTA PRIORIDAD)
```
FALTA IMPLEMENTAR:
- Crear carpeta por formulario dentro de la carpeta principal
- Generar documento Google Docs con respuestas
- Subir imágenes adjuntas al formulario
- Actualizar submissions en Firestore con folderId
```

### 3. ❌ GOOGLE_APPLICATION_CREDENTIALS (MEDIA PRIORIDAD)
```
Problema: Variable de entorno se genera automáticamente
Causa: Conflicto con OAuth de usuario
Impacto: Debe eliminarse manualmente para que OAuth funcione
```

## 🎯 Próximos Pasos (PRIORIZADOS)

### 🔥 ALTA PRIORIDAD - Flujo de Formularios
1. **Crear carpeta por formulario**
   - Dentro de `OnboardingAudit_luisdaniel883@gmail.com`
   - Nombre: Producto del formulario
   - Estructura: `OnboardingAudit_luisdaniel883@gmail.com/ProductoName_YYYYMMDD_HHMMSS/`

2. **Generar documento con respuestas**
   - Crear Google Docs con respuestas del formulario
   - Usar template o crear documento desde cero
   - Guardar en la carpeta del formulario

3. **Subir imágenes**
   - Procesar imágenes del formulario
   - Subir a la misma carpeta del formulario
   - Actualizar Firestore con referencias

### 🔧 MEDIA PRIORIDAD - Mejoras Técnicas
4. **Arreglar GOOGLE_APPLICATION_CREDENTIALS**
   - Investigar por qué se genera automáticamente
   - Configurar Firebase Admin SDK correctamente
   - Evitar conflictos con OAuth de usuario

5. **Migrar a Secret Manager**
   - Investigar permisos de IAM
   - Configurar credenciales de servicio
   - Reemplazar credenciales hardcodeadas

### 📊 BAJA PRIORIDAD - Mejoras
6. **Analytics y Reporting**
   - Mejorar dashboard de analytics
   - Generar reportes automáticos
   - Tracking de uso

## 📝 Notas Importantes

- ✅ **OAuth funciona completamente** con el workaround
- ✅ **Dashboard carga correctamente** las submissions
- ✅ **Carpeta se crea correctamente** en Google Drive
- ⚠️ **Credenciales hardcodeadas** funcionan pero no son ideales
- ❌ **Flujo de formularios** es la prioridad principal
- ❌ **Secret Manager** necesita investigación de permisos

## 🔄 Estado de Despliegue

### Último Despliegue Exitoso:
- ✅ **Functions**: `firebase deploy --only functions`
- ✅ **Hosting**: `firebase deploy --only hosting`
- ✅ **Build**: `npm run build` en frontend y backend

### URLs de Producción:
- **Hosting**: `https://uaylabs.web.app`
- **API Function**: `https://api-fu54nvsqfa-uc.a.run.app`
- **Dashboard**: `https://uaylabs.web.app/onboardingaudit/admin` 