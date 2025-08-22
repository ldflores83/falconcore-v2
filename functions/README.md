# Falcon Core V2 - Backend Functions

## 🚀 Resumen Ejecutivo

Falcon Core V2 es una plataforma backend **modular y escalable** diseñada específicamente para **venture builders** que necesitan desplegar múltiples productos SaaS rápidamente. El sistema proporciona una infraestructura compartida y segura que permite lanzar nuevos productos con mínima configuración.

### 🎯 Características Principales

- ✅ **Multi-Producto**: Soporte para múltiples productos SaaS simultáneamente
- ✅ **Seguridad Empresarial**: Aislamiento completo de datos y credenciales
- ✅ **Modularidad**: Componentes reutilizables y escalables
- ✅ **Administración Centralizada**: Panel único para gestionar todos los productos
- ✅ **Integración Cloud**: Conexión nativa con Google Drive, Firebase y servicios cloud

### 📊 Estado del Sistema

- **Modularidad**: 95% (ver [Análisis de Modularidad](./MODULARITY_ANALYSIS.md))
- **Productos Activos**: 6 (onboardingaudit, jobpulse, pulziohq, ignium, ahau, uaylabs)
- **Endpoints**: 15+ endpoints modulares unificados
- **Analytics**: Sistema completo con tracking en tiempo real en todos los frontends
- **Dashboards**: 2 dashboards funcionales con datos reales (LD General + OnboardingAudit)
- **Seguridad**: AES-256-GCM, OAuth 2.0, Rate Limiting
- **Escalabilidad**: Diseñado para 100+ productos

---

## 📚 Documentación Completa

### 🏗️ [Documentación de Arquitectura](./ARCHITECTURE_DOCUMENTATION.md)
Documentación técnica completa del sistema, incluyendo:
- Arquitectura de capas y principios de diseño
- Modelo de seguridad detallado
- Descripción de todos los módulos
- Flujos de datos principales
- Medidas de seguridad implementadas
- Configuración y despliegue
- Monitoreo y analytics
- Recomendaciones para venture builders

### 🔍 [Análisis de Modularidad](./MODULARITY_ANALYSIS.md)
Análisis detallado de la modularidad del sistema:
- Estado actual de cada módulo
- Dependencias identificadas
- Plan de refactorización
- Beneficios de la modularidad completa
- Recomendaciones de implementación
- Métricas de modularidad

### 📋 [Documentación Técnica Original](./src/README.md)
Documentación técnica específica del código actual.

---

## 🏗️ Arquitectura Rápida

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Producto A  │ │ Producto B  │ │ Producto C  │          │
│  │ (Next.js)   │ │ (Next.js)   │ │ (Next.js)   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Public    │ │    Auth     │ │   Admin     │          │
│  │  Endpoints  │ │  Endpoints  │ │  Endpoints  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   OAuth     │ │   Storage   │ │   Services  │          │
│  │  Module     │ │  Providers  │ │   Layer     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Firestore  │ │ Cloud Storage│ │Google Drive │          │
│  │  Database   │ │   Files     │ │  Documents  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Modelo de Seguridad

### Flujo de Seguridad de Datos
```
Usuario Público → Formulario → Firestore + Cloud Storage (SIN OAuth)
                                    ↓
Admin Autenticado → OAuth → Google Drive (CON credenciales encriptadas)
                                    ↓
Procesamiento → Sincronización → Limpieza de datos temporales
```

### Características de Seguridad
- ✅ **Encriptación AES-256-GCM**: Todos los tokens OAuth encriptados
- ✅ **Aislamiento por Producto**: Cada producto tiene su propia carpeta en Google Drive
- ✅ **Acceso Administrativo Único**: Solo el admin configurado puede acceder a los datos
- ✅ **Validación de Permisos**: Verificación en cada operación
- ✅ **Rate Limiting**: Protección contra spam y ataques
- ✅ **Auditoría Completa**: Logs de todas las operaciones

---

## 📦 Módulos del Sistema

### 1. **API Pública** (`/api/public`)
- Recepción de formularios sin acceso OAuth
- Carga de archivos con validación
- Verificación de límites
- Registro en waitlist
- **✅ Tracking de analytics** - Visitas en tiempo real

### 2. **Autenticación** (`/api/auth`)
- Verificación de autenticación
- Gestión de sesiones administrativas
- Generación de clientId
- Logout seguro

### 3. **Administración** (`/api/admin`)
- Procesamiento de submissions
- Gestión de datos del producto
- **✅ Analytics y métricas unificadas** - Datos reales
- **✅ Gestión de waitlist unificada** - Endpoints consolidados
- **✅ Dashboard global** - Estadísticas multi-producto

### 4. **OAuth** (`/oauth`)
- Flujo completo de autenticación OAuth
- Gestión de credenciales encriptadas
- Validación de permisos
- Gestión de sesiones

### 5. **Storage** (`/storage`)
- Interface unificada para múltiples proveedores
- Google Drive, Dropbox, OneDrive
- Operaciones de archivos y carpetas
- Estadísticas de uso

### 6. **Configuración** (`/config`)
- **✅ ProductConfig completamente implementado**
- Configuración dinámica de productos
- Gestión de admins por producto
- Features flags por producto

### 7. **Analytics System** (`/lib/analytics`)
- **✅ Tracker implementado en todos los frontends**
- Tracking automático de visitas y conversiones
- Cache inteligente y debounce
- Detección de dispositivo y referrer

---

## 🎉 Logros Recientes (Enero 2025)

### ✅ **Analytics System Completo**
- **Frontend Tracking**: Implementado en 6 productos (UayLabs, Ignium, Ahau, JobPulse, PulzioHQ, OnboardingAudit)
- **Tracking Automático**: Visitas, conversiones, tiempo en página, dispositivos
- **Dashboard en Tiempo Real**: Métricas actualizadas automáticamente
- **Datos Reales**: 40+ visitas registradas durante las pruebas

### ✅ **Dashboards Unificados**
- **Dashboard General (LD)**: Panel de control para todos los productos
- **Dashboard OnboardingAudit**: Migrado a endpoints unificados
- **Datos Consistentes**: Mismos endpoints y formato de datos
- **Funcionalidad Completa**: Analytics, waitlist, gestión de usuarios

### ✅ **Sistema Backend Consolidado**
- **Endpoints Unificados**: `/api/admin/analytics` y `/api/admin/waitlist`
- **Waitlist Funcional**: Formularios funcionando en todos los productos
- **Configuración Dinámica**: ProductConfig implementado
- **Testing Completo**: Scripts de prueba validando funcionamiento

### ✅ **Productos Completamente Funcionales**
- **UayLabs**: Landing principal con analytics ✅
- **Ignium**: Waitlist + analytics funcional ✅
- **Ahau**: Waitlist + analytics funcional ✅  
- **JobPulse**: Coming soon + analytics ✅
- **PulzioHQ**: Coming soon + analytics ✅
- **OnboardingAudit**: Dashboard admin completo ✅

### 📊 **Estadísticas del Sistema**
- **Productos Monitoreados**: 6
- **Endpoints Activos**: 15+
- **Visitas Registradas**: 40+ (solo en pruebas)
- **Dashboards Funcionales**: 2
- **Formularios Activos**: 3 (Ignium, Ahau, OnboardingAudit)

---

## 🚀 Despliegue Rápido

### 1. **Configuración Inicial**
```bash
# Variables de entorno requeridas
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/oauth/callback
ENCRYPTION_KEY=32_byte_hex_string
FIREBASE_PROJECT_ID=falconcore-v2
```

### 2. **Configuración de Productos**
```typescript
// functions/src/config/projectAdmins.ts
export const PROJECT_ADMINS: Record<string, string> = {
  'onboardingaudit': 'admin@company.com',
  'jobpulse': 'admin@company.com',
  'pulziohq': 'admin@company.com',
  'ignium': 'admin@company.com',
  // Agregar nuevos productos aquí
};
```

### 3. **Despliegue**
```bash
# Instalación y compilación
npm install
npm run build

# Despliegue a Firebase
firebase deploy --only functions

# Verificación
firebase functions:log --only api
```

---

## 📊 Monitoreo y Analytics

### Logs Estructurados
```typescript
console.log('✅ Form submission processed:', {
  submissionId: docRef.id,
  email: formData.report_email,
  productName: formData.product_name,
  projectId: projectIdFinal,
  timestamp: new Date().toISOString(),
});
```

### Métricas Recopiladas
- ✅ Tiempo de respuesta de operaciones
- ✅ Tasa de éxito por producto
- ✅ Uso de recursos por producto
- ✅ Errores y excepciones
- ✅ Intentos de acceso no autorizado

---

## 🎯 Beneficios para Venture Builders

### **Despliegue Rápido**
- Nuevos productos en **5-10 minutos**
- Configuración declarativa
- Sin necesidad de desarrollo adicional

### **Costos Reducidos**
- Infraestructura compartida
- Desarrollo una sola vez
- Mantenimiento centralizado

### **Escalabilidad Infinita**
- Soporte para **100+ productos**
- Escalabilidad independiente por producto
- Recursos optimizados

### **Seguridad Empresarial**
- Aislamiento completo de datos
- Encriptación de grado militar
- Auditoría completa

---

## 🔮 Roadmap

### **Corto Plazo (1-3 meses)**
- [ ] Implementación de DropboxProvider
- [ ] Sistema de notificaciones por email
- [ ] Dashboard de analytics mejorado
- [ ] API rate limiting más granular

### **Mediano Plazo (3-6 meses)**
- [ ] Implementación de OneDriveProvider
- [ ] Sistema de webhooks para integraciones
- [ ] API GraphQL para consultas complejas
- [ ] Sistema de versionado de documentos

### **Largo Plazo (6+ meses)**
- [ ] Machine Learning para detección de anomalías
- [ ] Sistema de recomendaciones automáticas
- [ ] Integración con herramientas de BI
- [ ] API pública para desarrolladores

---

## 📞 Soporte y Contacto

### **Documentación**
- [Documentación de Arquitectura](./ARCHITECTURE_DOCUMENTATION.md)
- [Análisis de Modularidad](./MODULARITY_ANALYSIS.md)
- [Documentación Técnica](./src/README.md)

### **Comandos Útiles**
```bash
# Ver logs en tiempo real
firebase functions:log --only api --follow

# Listar funciones desplegadas
firebase functions:list

# Probar health check
curl https://us-central1-falconcore-v2.cloudfunctions.net/api/health
```

---

**Versión**: 2.0  
**Estado**: Producción  
**Última actualización**: 2025-01-27  
**Próxima revisión**: 2025-04-27
