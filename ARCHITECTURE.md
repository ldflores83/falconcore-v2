# 🏗️ Arquitectura Falcon Core V2

## 📋 Resumen Ejecutivo

**Falcon Core V2** es una plataforma de venture building que permite a UayLabs validar múltiples MVPs bajo un dominio unificado. Cada producto tiene su propio frontend pero comparte recursos del backend de forma modular y escalable.

## 🎯 Objetivos de la Arquitectura

1. **Venture Building**: UayLabs es una venture builder que busca probar varios MVPs bajo su dominio
2. **Frontends Independientes**: Cada producto tiene su propio frontend (onboardingaudit, ignium, jobpulse, etc.)
3. **Backend Compartido**: Todos los frontends comparten recursos del backend con funciones genéricas
4. **OAuth Modular**: Sistema OAuth independiente por frontend con registros separados
5. **Escalabilidad**: Arquitectura preparada para agregar nuevos productos fácilmente

## 🏛️ Estructura del Proyecto

```
falcon-core-v2/
├── frontends/                    # Frontends de productos
│   ├── uaylabs/                 # Frontend principal (hosting)
│   │   ├── out/                 # Build de todos los productos
│   │   │   ├── index.html       # Landing principal
│   │   │   ├── onboardingaudit/ # Subruta del producto
│   │   │   ├── ignium/          # Subruta del producto
│   │   │   ├── jobpulse/        # Subruta del producto
│   │   │   └── pulziohq/        # Subruta del producto
│   │   └── pages/
│   ├── onboardingaudit/         # Componentes específicos
│   ├── ignium/                  # Componentes específicos
│   ├── jobpulse/                # Componentes específicos
│   └── pulziohq/                # Componentes específicos
├── functions/                   # Backend (Cloud Functions)
│   └── src/
│       ├── api/                 # APIs genéricas
│       │   ├── public/          # APIs públicas (sin auth)
│       │   ├── auth/            # APIs de autenticación
│       │   └── admin/           # APIs administrativas
│       ├── oauth/               # Sistema OAuth modular
│       └── storage/             # Proveedores de storage
└── config/                      # Configuración global
```

## 🌐 URLs y Rutas

### Dominio Principal
- **Hosting**: `uaylabs.web.app`
- **Functions**: `api-fu54nvsqfa-uc.a.run.app`

### Productos Actuales
- **Onboarding Audit**: `uaylabs.web.app/onboardingaudit`
- **Ignium**: `uaylabs.web.app/ignium`
- **JobPulse**: `uaylabs.web.app/jobpulse`
- **PulzioHQ**: `uaylabs.web.app/pulziohq`

## 🔄 Flujo de Datos

### 1. Frontend → Backend
```
Frontend (onboardingaudit) 
  ↓ POST /onboardingaudit/api/public/receiveForm
Firebase Hosting Rewrite
  ↓ Rewrite: /onboardingaudit/api/** → function:api
Cloud Function (api)
  ↓ Intercepting Middleware
Handler (receiveForm.ts)
  ↓ Google Drive (Admin Credentials)
Storage (Google Drive)
```

### 2. OAuth por Producto
```
Frontend (onboardingaudit)
  ↓ GET /onboardingaudit/api/oauth/login
Cloud Function
  ↓ getOAuthCredentials(userId = 'onboardingaudit_user')
Firestore (OAuth Data)
  ↓ Google OAuth
Google Drive (User-specific)
```

## 🔧 Configuración Firebase

### firebase.json
```json
{
  "hosting": {
    "target": "uaylabs",
    "public": "frontends/uaylabs/out",
    "rewrites": [
      {
        "source": "/onboardingaudit/api/**",
        "function": "api",
        "region": "us-central1"
      }
    ]
  }
}
```

### .firebaserc
```json
{
  "targets": {
    "falconcore-v2": {
      "hosting": {
        "uaylabs": ["uaylabs"]
      }
    }
  }
}
```

## 📦 Build y Deploy

### Scripts Optimizados por Producto
Cada producto tiene su propio script que preserva los builds de otros productos:

```powershell
# Desde cada carpeta de producto
cd frontends/onboardingaudit
.\build-and-deploy.ps1

cd frontends/ignium  
.\build-and-deploy.ps1

cd frontends/jobpulse
.\build-and-deploy.ps1

cd frontends/pulziohq
.\build-and-deploy.ps1
```

### Script Recomendado (Todos los Productos)
El script que funciona correctamente es `scripts/quick-build.ps1`:

```powershell
# Build y deploy de todos los frontends
.\scripts\quick-build.ps1
```

### Script Completo (Frontend + Backend)
```powershell
# Build y deploy completo (frontends + backend)
.\scripts\build-all-products.ps1
```

### Build Manual de Productos
```bash
# Build uaylabs (estructura base) - solo si no existe
cd frontends/uaylabs && npm run build

# Build productos individuales
cd frontends/ignium && npm run build
cd frontends/jobpulse && npm run build  
cd frontends/pulziohq && npm run build
cd frontends/onboardingaudit && npm run build

# Deploy
firebase deploy --only hosting
```

### Deploy Functions (Backend)
```bash
# Deploy backend compartido
cd functions
npm run build
firebase deploy --only functions:api
```

## 🔐 Sistema OAuth Modular

### Estructura de Usuarios
```
Firestore Collection: oauth_credentials
├── onboardingaudit_user     # Usuario para onboardingaudit
├── ignium_user             # Usuario para ignium
├── jobpulse_user           # Usuario para jobpulse
└── pulziohq_user          # Usuario para pulziohq
```

### Credenciales por Producto
- **onboardingaudit**: `luisdaniel883@gmail.com` (admin)
- **ignium**: Usuario específico del producto
- **jobpulse**: Usuario específico del producto
- **pulziohq**: Usuario específico del producto

## 🛠️ APIs Genéricas

### Public APIs (Sin Auth)
- `POST /api/public/receiveForm` - Recibir formularios
- `POST /api/public/uploadAsset` - Subir archivos
- `POST /api/public/trackVisit` - Tracking de visitas
- `GET /api/public/getUsageStatus` - Estado de uso

### Auth APIs
- `GET /api/oauth/login` - Login OAuth
- `GET /api/oauth/callback` - Callback OAuth
- `GET /api/auth/check` - Verificar autenticación
- `POST /api/auth/logout` - Logout

### Admin APIs
- `GET /api/admin/submissions` - Listar submissions
- `GET /api/admin/analytics` - Analytics

## 🔄 Middleware de Interceptación

### Problema Resuelto
Firebase Hosting rewrites causan que `req.path` sea `/` en Cloud Functions, pero `req.originalUrl` mantiene la ruta completa.

### Solución
```typescript
// functions/src/app.ts
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.includes('/onboardingaudit/api/')) {
    // Interceptar y redirigir basándose en originalUrl
    if (req.originalUrl.includes('/onboardingaudit/api/public/receiveForm')) {
      return receiveForm(req, res);
    }
    // ... más handlers
  }
});
```

## 📊 Estado Actual

### ✅ Funcionando
- [x] Formulario onboardingaudit se envía correctamente
- [x] Documentos se crean en Google Drive
- [x] Sistema OAuth modular
- [x] Middleware de interceptación
- [x] Build y deploy automatizado (`quick-build.ps1`)

### 🔄 En Progreso
- [ ] Archivos adjuntos en onboardingaudit
- [ ] Login OAuth para admin panel
- [ ] Analytics dashboard

### 📋 Pendiente
- [ ] Nuevos productos (ignium, jobpulse, pulziohq)
- [ ] Templates de documentos
- [ ] Sistema de notificaciones
- [ ] Métricas avanzadas

## 🚀 Escalabilidad

### Agregar Nuevo Producto
1. **Crear frontend**: `frontends/nuevoproducto/`
2. **Configurar build**: `next.config.js` → `distDir: '../uaylabs/out/nuevoproducto'`
3. **Agregar rewrite**: `firebase.json` → `/nuevoproducto/api/**`
4. **Crear usuario OAuth**: `nuevoproducto_user` en Firestore
5. **Deploy**: `firebase deploy --only hosting`

### Ventajas de la Arquitectura
- ✅ **Modular**: Cada producto es independiente
- ✅ **Escalable**: Fácil agregar nuevos productos
- ✅ **Compartido**: Backend eficiente y reutilizable
- ✅ **Mantenible**: Código organizado y documentado
- ✅ **Seguro**: OAuth por producto, credenciales separadas

## 📝 Notas Importantes

1. **Build Path**: Todos los productos se build en `frontends/uaylabs/out/`
2. **API Naming**: Funciones genéricas que aceptan `projectId` como parámetro
3. **OAuth Isolation**: Cada producto tiene su propio usuario y credenciales
4. **Firebase Rewrites**: Manejo especial para rutas con `/api/` duplicado
5. **Admin Credentials**: `luisdaniel883@gmail.com` es el admin global
6. **Script Confiable**: `quick-build.ps1` es el script que funciona sin errores 