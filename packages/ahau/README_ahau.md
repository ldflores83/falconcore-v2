# AHAU - El liderazgo, sincronizado

AHAU es una plataforma para gestionar y sincronizar el contenido de liderazgo de las organizaciones.

## 🏗️ Arquitectura

### Frontend
- **Framework**: Next.js con TypeScript
- **Estilos**: Tailwind CSS con componentes personalizados
- **Autenticación**: Firebase Auth (Google + Email/Password)
- **Configuración**: Runtime desde `/ahau/config.json`

### Backend
- **Platform**: Firebase Functions v2
- **Base de datos**: Firestore
- **Autenticación**: Firebase Admin SDK con verifyIdToken
- **Estructura**: Modular con routers específicos por producto

## 📁 Estructura de Rutas

### Frontend
```
/ahau/
├── /                    # Landing page (redirección automática)
├── /login              # Página de autenticación
├── /dashboard          # Dashboard principal
├── /dashboard/users    # Gestión de usuarios
├── /dashboard/settings # Configuración del workspace
└── /dashboard/content  # Gestión de contenido
```

### Backend API
```
/api/ahau/
├── POST /session/verify        # Verificar sesión del usuario
├── POST /tenants.create        # Crear nuevo tenant
├── POST /users.invite          # Invitar usuario (admin)
├── GET  /users.list            # Listar usuarios del tenant
├── POST /users.acceptInvite    # Aceptar invitación
├── POST /tenant.update         # Actualizar tenant (admin)
├── POST /drafts.create         # Crear draft
└── GET  /drafts.list           # Listar drafts del tenant
```

## 🔐 Seguridad

### Reglas de Firestore
- **Aislamiento por tenant**: Usuarios solo pueden acceder a su tenant
- **Roles**: `admin` y `member` con permisos diferenciados
- **Validación**: Middleware `verifyTenantAccess` en todos los endpoints

### Autenticación
- **Firebase Auth**: Sin scopes de Drive (diferente a OnboardingAudit)
- **Tokens**: Verificación con `verifyIdToken` en backend
- **Sesiones**: Contexto de autenticación en frontend

## 🚀 Configuración

### Firebase Console (Manual)

1. **Authentication**:
   - Habilitar Google Sign-in
   - Habilitar Email/Password
   - Agregar dominios autorizados: `localhost`, `uaylabs.web.app`, `ahau.io`

2. **Firestore**:
   - Crear colecciones: `users`, `accounts`, `tenants`
   - Publicar reglas de seguridad

3. **Hosting**:
   - Verificar rutas `/ahau/*` configuradas
   - Verificar `/ahau/config.json` accesible

### Configuración Runtime

Archivo: `public/ahau/config.json`
```json
{
  "apiKey": "YOUR_FIREBASE_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT.firebasestorage.app",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

## 📊 Estructura de Datos

### Colecciones Firestore

#### `users/{uid}` (Milestone A compatibility)
```typescript
{
  authUid: string,
  email: string,
  tenantId: string,
  role: 'admin' | 'user',
  displayName?: string
}
```

#### `accounts/{tenantId}` (Milestone A compatibility)
```typescript
{
  name: string,
  createdAt: Timestamp,
  createdBy: string,
  status: 'active' | 'inactive'
}
```

#### `tenants/{tenantId}` (Milestone B)
```typescript
{
  id: string,
  name: string,
  logoUrl?: string,
  createdAt: Timestamp,
  createdBy: string
}
```

#### `tenants/{tenantId}/users/{uid}`
```typescript
{
  uid: string,
  email: string,
  role: 'admin' | 'member',
  status: 'active' | 'invited',
  addedAt: Timestamp,
  invitedBy?: string,
  acceptedAt?: Timestamp
}
```

#### `tenants/{tenantId}/drafts/{draftId}`
```typescript
{
  title: string,
  content: string,
  createdBy: string,
  createdAt: Timestamp
}
```

## 🔄 Flujos de Usuario

### 1. Registro/Login
```
Usuario → Login (Google/Email) → Verificar sesión → 
Si no tiene tenant → Crear tenant → Dashboard
```

### 2. Invitación de Usuarios
```
Admin → Invitar email → Usuario recibe invitación → 
Usuario login → Aceptar invitación → Acceso al tenant
```

### 3. Gestión de Contenido
```
Usuario → Crear draft → Guardar en tenant → 
Listar drafts → Editar/Ver contenido
```

## 🧪 Pruebas

### Checklist de Pruebas Manuales

#### Autenticación
- [ ] Login con Google funciona
- [ ] Login con Email/Password funciona
- [ ] Registro de nuevos usuarios funciona
- [ ] Redirección automática si ya autenticado

#### Gestión de Tenants
- [ ] Creación de tenant post-registro
- [ ] Creación de tenant post-login con Google
- [ ] Estructura de datos correcta en Firestore

#### Gestión de Usuarios
- [ ] Admin puede invitar usuarios
- [ ] Usuario invitado puede aceptar invitación
- [ ] Lista de usuarios muestra roles correctos
- [ ] Solo admins pueden invitar

#### Gestión de Contenido
- [ ] Usuarios pueden crear drafts
- [ ] Drafts se guardan en tenant correcto
- [ ] Lista de drafts funciona
- [ ] Aislamiento entre tenants

#### Seguridad
- [ ] Usuario A no puede acceder a tenant de Usuario B
- [ ] Miembros no pueden actualizar configuración
- [ ] Reglas de Firestore funcionan correctamente

#### UI/UX
- [ ] Navegación entre tabs funciona
- [ ] Estados de carga se muestran
- [ ] Mensajes de error son claros
- [ ] Responsive design funciona

## 🛠️ Scripts

### Build y Deploy
```bash
# Build frontend
npm run build --workspace=frontends/ahau

# Deploy reglas Firestore
npm run firebase:deploy:rules

# Deploy completo AHAU
npm run deploy:ahau
```

### Desarrollo
```bash
# Frontend
cd frontends/ahau
npm run dev

# Backend
cd functions
npm run build
npm run serve
```

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de configuración Firebase**:
   - Verificar `/ahau/config.json` existe y es accesible
   - Verificar credenciales en Firebase Console

2. **Error de autenticación**:
   - Verificar dominios autorizados en Firebase Console
   - Verificar métodos de autenticación habilitados

3. **Error de permisos**:
   - Verificar reglas de Firestore desplegadas
   - Verificar estructura de datos en Firestore

4. **Error de API**:
   - Verificar Functions desplegadas
   - Verificar logs en Firebase Console

## 📝 Changelog

### Milestone A (Completado)
- ✅ Autenticación con Firebase Auth
- ✅ Creación de tenants
- ✅ Dashboard básico
- ✅ Protección de rutas

### Milestone B (Completado)
- ✅ Reglas de Firestore con aislamiento por tenant
- ✅ Gestión de usuarios y roles
- ✅ Sistema de invitaciones
- ✅ Gestión de contenido (drafts)
- ✅ Dashboard navegable con tabs
- ✅ Configuración de workspace

## 🤝 Contribución

1. Crear branch desde `main`
2. Implementar cambios
3. Ejecutar pruebas
4. Crear PR con descripción detallada

## 📄 Licencia

Proyecto interno de FalconCore/UayLabs.
