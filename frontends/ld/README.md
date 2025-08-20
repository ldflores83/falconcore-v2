# LD Admin Dashboard - Centralizado

Dashboard de administración centralizado para todos los productos de UayLabs Venture Builder.

## 🚀 **Características**

- **Vista Centralizada**: Gestión unificada de todos los productos
- **Analytics Globales**: Estadísticas consolidadas de visitas, submissions y waitlists
- **Gestión de Productos**: Control centralizado del estado y configuración
- **Waitlists Unificados**: Administración de listas de espera por producto
- **Autenticación OAuth**: Sistema de login seguro con Google
- **Responsive Design**: Optimizado para desktop y mobile

## 🏗️ **Arquitectura**

### **Frontend**
- **Framework**: Next.js 14 con TypeScript
- **Styling**: Tailwind CSS con componentes personalizados
- **Estado**: React Hooks para gestión de estado local
- **API**: Cliente centralizado para comunicación con backend

### **Backend**
- **Cloud Functions**: APIs compartidas para todos los productos
- **Firestore**: Base de datos centralizada
- **OAuth**: Autenticación con Google
- **Separación por Producto**: Colecciones independientes para cada producto

## 📁 **Estructura del Proyecto**

```
frontends/ld/
├── components/
│   └── Layout/
│       ├── AdminLayout.tsx    # Layout principal
│       ├── Sidebar.tsx        # Navegación lateral
│       └── Header.tsx         # Header superior
├── lib/
│   └── api.ts                 # Cliente API centralizado
├── pages/
│   ├── index.tsx              # Dashboard principal
│   ├── products.tsx           # Gestión de productos
│   └── _app.tsx               # App principal
├── styles/
│   └── globals.css            # Estilos globales
├── types/
│   └── admin.ts               # Interfaces TypeScript
└── build-and-deploy.ps1       # Script de deploy
```

## 🔧 **Configuración**

### **Dependencias**
El proyecto reutiliza las dependencias compartidas de `/frontends`:
- `next`, `react`, `react-dom` (compartidos)
- `tailwindcss`, `postcss`, `autoprefixer` (compartidos)
- Solo `axios` es específico para este proyecto

### **Variables de Entorno**
```bash
# API Base URL (ya configurada)
API_BASE_URL=https://api-fu54nvsqfa-uc.a.run.app/api
```

## 🚀 **Desarrollo**

### **Instalación**
```bash
cd frontends/ld
# Las dependencias ya están instaladas en /frontends
```

### **Desarrollo Local**
```bash
npm run dev
# El dashboard estará disponible en http://localhost:3000
```

### **Build y Deploy**
```bash
# Build y deploy automático
.\build-and-deploy.ps1

# O manualmente
npm run build
firebase deploy --only hosting:uaylabs
```

## 🌐 **URLs de Producción**

- **Dashboard Principal**: https://uaylabs.web.app/ld
- **Productos**: https://uaylabs.web.app/ld/products
- **Analytics**: https://uaylabs.web.app/ld/analytics

## 📊 **Productos Soportados**

1. **OnboardingAudit** - Auditorías de onboarding
2. **Ahau** - Sincronización de liderazgo
3. **Ignium** - Copiloto táctico para solopreneurs
4. **JobPulse** - Gestión de empleos
5. **PulzioHQ** - Herramientas de productividad

## 🔐 **Autenticación**

El dashboard utiliza el sistema de OAuth existente:
- **Login**: Google OAuth
- **Sesiones**: Persistencia en localStorage
- **Permisos**: Basados en clientId y projectId
- **Seguridad**: Validación de tokens en cada request

## 📈 **Métricas Disponibles**

### **Globales**
- Total de productos activos
- Visitas totales consolidadas
- Submissions totales
- Waitlists totales
- Usuarios activos

### **Por Producto**
- Visitas individuales
- Submissions por estado
- Waitlist por estado
- Tasa de conversión
- Actividad reciente

## 🛠️ **Próximas Funcionalidades**

- [ ] **Dashboard de Usuarios**: Gestión de usuarios y permisos
- [ ] **Configuración Global**: Ajustes del sistema centralizado
- [ ] **Notificaciones**: Sistema de alertas y notificaciones
- [ ] **Exportación**: Reportes en PDF/Excel
- [ ] **Integraciones**: Webhooks y APIs externas

## 🤝 **Contribución**

Este dashboard está diseñado para ser extensible:
1. **Nuevos Productos**: Agregar en `types/admin.ts` y `lib/api.ts`
2. **Nuevas Métricas**: Extender interfaces y componentes
3. **Nuevas Funcionalidades**: Crear componentes en `components/`

## 📞 **Soporte**

Para soporte técnico o nuevas funcionalidades:
- **Equipo**: UayLabs Development Team
- **Repositorio**: falcon-core-v2
- **Documentación**: Este README y comentarios en código
