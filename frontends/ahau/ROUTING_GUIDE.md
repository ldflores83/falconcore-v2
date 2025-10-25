# 🛣️ Guía de Enrutamiento - AHAU

## 📍 **Configuración de Rutas**

### **Problema Identificado**
- **Antes**: Las rutas se servían en `uaylabs.web.app/dashboard` (incorrecto)
- **Después**: Las rutas se sirven en `uaylabs.web.app/ahau/dashboard` (correcto)

### **Configuración de Next.js**
```javascript
// next.config.js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: '../uaylabs/out/ahau',
  assetPrefix: '/ahau',
  basePath: '/ahau',  // ← CLAVE: Prefijo de ruta
  images: {
    unoptimized: true
  }
}
```

## 🔧 **Sistema de Rutas Implementado**

### **1. Archivo de Utilidades (`lib/routes.ts`)**
```typescript
// Rutas base del producto Ahau
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  MEMBERS: '/members',
  DRAFTS: '/drafts',
  USERS: '/dashboard/users',
  CONTENT: '/dashboard/content',
} as const;

// Función para obtener ruta completa con prefijo /ahau
export function getRoute(path: string): string {
  if (path.startsWith('/ahau')) return path;
  if (path.startsWith('/')) return `/ahau${path}`;
  return `/ahau/${path}`;
}
```

### **2. Uso en Componentes**
```typescript
import { getRoute } from '../lib/routes';

// ❌ INCORRECTO (ruta hardcodeada)
router.push('/dashboard');

// ✅ CORRECTO (ruta con prefijo)
router.push(getRoute('/dashboard'));
// Resultado: /ahau/dashboard
```

## 🚀 **Rutas Disponibles**

| Ruta Interna | URL Final | Descripción |
|--------------|-----------|-------------|
| `/` | `/ahau/` | Página principal |
| `/login` | `/ahau/login` | Página de login |
| `/dashboard` | `/ahau/dashboard` | Dashboard principal |
| `/settings` | `/ahau/settings` | Configuración |
| `/members` | `/ahau/members` | Gestión de miembros |
| `/drafts` | `/ahau/drafts` | Borradores |
| `/dashboard/users` | `/ahau/dashboard/users` | Usuarios del dashboard |
| `/dashboard/content` | `/ahau/dashboard/content` | Contenido del dashboard |

## 🔄 **Flujo de Navegación**

### **1. Usuario no autenticado**
```
/ahau/ → /ahau/login → /ahau/dashboard
```

### **2. Usuario autenticado (refresh)**
```
/ahau/dashboard → Mantiene la ruta (persistencia)
```

### **3. Navegación interna**
```
/ahau/dashboard → /ahau/settings → /ahau/members
```

## 🛡️ **Protección de Rutas**

### **ProtectedRoute Component**
```typescript
// Solo redirigir si no está cargando y no hay usuario
if (!isLoading && !user) {
  const loginRoute = getRoute('/login');
  router.push(loginRoute);
}
```

### **Verificación de Rutas Activas**
```typescript
// Función para verificar si una ruta está activa
const isActiveRoute = (path: string) => {
  const baseRoute = path;
  const currentBaseRoute = currentPath.replace('/ahau', '');
  return currentBaseRoute === baseRoute || currentBaseRoute === `${baseRoute}/`;
};
```

## 📱 **Responsive y Navegación**

### **DashboardNav**
- **Desktop**: Navegación horizontal con todas las rutas
- **Mobile**: Menú hamburguesa colapsable
- **Rutas activas**: Resaltadas con color dorado

### **Menú Móvil**
```typescript
{isMobileMenuOpen && (
  <div className="md:hidden border-t border-white/10 bg-white/5">
    <nav className="py-4 space-y-2">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => handleNavClick(item.path)}
          className={`w-full text-left px-4 py-3 rounded-lg...`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  </div>
)}
```

## 🔍 **Debugging de Rutas**

### **Verificar Ruta Actual**
```typescript
const router = useRouter();
console.log('Ruta actual:', router.pathname);
console.log('Ruta base:', router.pathname.replace('/ahau', ''));
```

### **Verificar Ruta Generada**
```typescript
import { getRoute } from '../lib/routes';

const fullPath = getRoute('/dashboard');
console.log('Ruta completa:', fullPath); // /ahau/dashboard
```

## ⚠️ **Errores Comunes**

### **1. Rutas Hardcodeadas**
```typescript
// ❌ NO HACER
router.push('/dashboard');
window.location.href = '/settings';

// ✅ HACER
router.push(getRoute('/dashboard'));
router.push(getRoute('/settings'));
```

### **2. Links HTML**
```html
<!-- ❌ NO HACER -->
<a href="/dashboard">Dashboard</a>

<!-- ✅ HACER -->
<a href={getRoute('/dashboard')}>Dashboard</a>
```

### **3. Redirecciones en useEffect**
```typescript
// ❌ NO HACER
useEffect(() => {
  if (!user) router.push('/login');
}, [user]);

// ✅ HACER
useEffect(() => {
  if (!user) router.push(getRoute('/login'));
}, [user]);
```

## 🧪 **Pruebas de Rutas**

### **1. Verificar Build**
```bash
npm run build
# Debe generar páginas en ../uaylabs/out/ahau/
```

### **2. Verificar URLs Finales**
- ✅ `uaylabs.web.app/ahau/` → Página principal
- ✅ `uaylabs.web.app/ahau/dashboard` → Dashboard
- ✅ `uaylabs.web.app/ahau/settings` → Configuración

### **3. Verificar Navegación**
- ✅ Login → Dashboard (redirección automática)
- ✅ Dashboard → Settings (navegación interna)
- ✅ Refresh en cualquier página (persistencia)

## 📚 **Referencias**

- **Next.js basePath**: [Documentación oficial](https://nextjs.org/docs/api-reference/next.config.js/basepath)
- **Next.js assetPrefix**: [Documentación oficial](https://nextjs.org/docs/api-reference/next.config.js/assetprefix)
- **Next.js trailingSlash**: [Documentación oficial](https://nextjs.org/docs/api-reference/next.config.js/trailingslash)

---

**Estado**: ✅ **IMPLEMENTADO Y FUNCIONANDO**
**Última actualización**: Diciembre 2024
**Responsable**: AI Assistant (Cursor)
