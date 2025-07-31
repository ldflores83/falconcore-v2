# Frontends - Arquitectura Multi-Producto

Este directorio contiene todos los frontends de los productos de UayLabs, organizados en una arquitectura modular que permite desarrollo independiente y despliegue centralizado.

## 🏗️ Arquitectura

```
frontends/
├── uaylabs/        # Landing principal de UayLabs (Venture Builder)
├── ignium/         # Landing del producto Ignium
├── jobpulse/       # Landing del producto JobPulse
├── pulziohq/       # Landing del producto PulzioHQ
├── onboardingaudit/ # Módulo de Auditoría de Onboarding
└── node_modules/   # Dependencias compartidas (optimización)
```

### 📋 Productos Actuales

| Producto | Descripción | URL Local | URL Producción |
|----------|-------------|-----------|----------------|
| **UayLabs** | Landing principal del venture builder | `http://localhost:3000/` | `https://uaylabs.web.app/` |
| **Ignium** | Landing del producto Ignium | `http://localhost:3000/` | `https://uaylabs.web.app/ignium/` |
| **JobPulse** | Landing del producto JobPulse | `http://localhost:3000/` | `https://uaylabs.web.app/jobpulse/` |
| **PulzioHQ** | Landing del producto PulzioHQ | `http://localhost:3000/` | `https://uaylabs.web.app/pulziohq/` |
| **OnboardingAudit** | Módulo de Auditoría de Onboarding | `http://localhost:3000/` | `https://uaylabs.web.app/onboardingaudit/` |

## 🚀 Desarrollo

### Estructura de cada producto

Cada producto sigue la misma estructura Next.js:

```
producto/
├── pages/
│   ├── index.tsx      # Landing principal del producto
│   └── _app.tsx       # Configuración de la app
├── components/         # Componentes específicos del producto
├── lib/               # Utilidades y APIs específicas
├── types/             # Tipos TypeScript específicos
├── styles/
│   └── globals.css    # Estilos globales (Tailwind)
├── package.json       # Dependencias específicas
├── next.config.js     # Configuración Next.js
├── tailwind.config.js # Configuración Tailwind
├── tsconfig.json      # Configuración TypeScript
└── postcss.config.js  # Configuración PostCSS
```

### 🎯 Configuración de Build Centralizada

**Nueva arquitectura de builds:**
```
frontends/uaylabs/out/
├── index.html              # Página principal de UayLabs
├── ignium/
│   ├── index.html          # Página de Ignium
│   └── _next/              # Assets estáticos
├── jobpulse/
│   ├── index.html          # Página de Jobpulse
│   └── _next/              # Assets estáticos
├── pulziohq/
│   ├── index.html          # Página de Pulziohq
│   └── _next/              # Assets estáticos
├── onboardingaudit/
│   ├── index.html          # Página de OnboardingAudit
│   └── _next/              # Assets estáticos
└── _next/                  # Assets compartidos
```

**Configuración `next.config.js` por producto:**
```javascript
/** @type {import('next').Config} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: '../uaylabs/out/[producto]',  // Build centralizado
  assetPrefix: './',                      // ✅ Rutas relativas para assets
  basePath: '',                           // ✅ Base path vacío
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### Comandos de desarrollo

```bash
# Navegar al producto
cd frontends/[producto]

# Instalar dependencias (usando node_modules compartido)
npm install

# Servidor de desarrollo
npm run dev

# Construir para producción (genera en uaylabs/out/[producto])
npm run build

# Desplegar a Firebase (usando scripts optimizados)
# Desde el directorio raíz del proyecto:
.\scripts\build-[producto].ps1
```

### 🔧 Sistema de Dependencias Compartidas

Para optimizar el almacenamiento y evitar duplicación, se implementó un sistema de dependencias compartidas:

#### Estructura de dependencias:
```
frontends/
├── package.json          # Dependencias compartidas
├── node_modules/         # Dependencias compartidas
└── [producto]/
    ├── package.json      # Solo configuraciones específicas
    └── (sin node_modules local)
```

#### Dependencias compartidas incluidas:
- **React & Next.js**: `react`, `react-dom`, `next`
- **Herramientas de desarrollo**: `typescript`, `eslint`, `tailwindcss`
- **Utilidades**: `axios` para llamadas HTTP
- **Tipos**: `@types/react`, `@types/node`

#### Configuración de proyectos:
Cada proyecto debe tener un `package.json` con scripts que usen `npx --prefix ../`:

```json
{
  "scripts": {
    "dev": "npx --prefix ../ next dev",
    "build": "npx --prefix ../ next build",
    "start": "npx --prefix ../ next start",
    "lint": "npx --prefix ../ next lint"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

#### Agregar nuevas dependencias compartidas:
```bash
cd frontends
npm install [nueva-dependencia]
```

## ➕ Crear un nuevo producto

### 1. Crear la estructura del producto

```bash
# Crear directorio del producto
mkdir frontends/[nuevo-producto]

# Crear estructura básica
cd frontends/[nuevo-producto]
mkdir pages styles
```

### 2. Crear archivos de configuración

**package.json:**
```json
{
  "name": "[nuevo-producto]",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "npx --prefix ../ next dev",
    "build": "npx --prefix ../ next build",
    "start": "npx --prefix ../ next start",
    "lint": "npx --prefix ../ next lint",
    "export": "npx --prefix ../ next build",
    "deploy": "npm run build && firebase deploy --only hosting:uaylabs"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: '../uaylabs/out/[nuevo-producto]',  // ⚠️ IMPORTANTE: Cambiar por el nombre real
  assetPrefix: './',                              // ✅ Rutas relativas para assets
  basePath: '',                                   // ✅ Base path vacío
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**postcss.config.js:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Crear archivos de la aplicación

**pages/_app.tsx:**
```tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
```

**styles/globals.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**pages/index.tsx:**
```tsx
import React from 'react';
import Head from 'next/head';

export default function NuevoProducto() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[color1] to-[color2] flex items-center justify-center">
      <Head>
        <title>[Nuevo Producto] - UayLabs Venture Builder</title>
        <meta name="description" content="[Descripción del producto]" />
      </Head>
      
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">[Nuevo Producto]</h1>
        <p className="text-xl mb-8">Coming Soon</p>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">🚀 Producto en Desarrollo</h2>
          <p className="text-gray-200">
            Estamos trabajando en algo increíble. 
            Pronto tendrás más información sobre este nuevo producto de UayLabs.
          </p>
          <a 
            href="/"
            className="inline-block mt-6 px-6 py-3 bg-white text-[color] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Volver a UayLabs
          </a>
        </div>
      </div>
    </div>
  );
}
```

### 4. Instalar dependencias y probar

```bash
# Instalar dependencias
npm install

# Probar el servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🎨 Personalización

### Colores por producto

Cada producto puede tener su propia paleta de colores:

- **UayLabs**: `from-slate-900 via-purple-900 to-slate-900`
- **Ignium**: `from-[#1a1a2e] to-[#0f0f1a]`
- **JobPulse**: `from-green-600 to-teal-600`
- **PulzioHQ**: `from-purple-600 to-blue-600`

### Componentes reutilizables

Para componentes compartidos entre productos, considera crear una librería de componentes en el directorio raíz.

## 🚀 Despliegue

### Sistema de Scripts de Build y Deploy

Se ha implementado un sistema optimizado de scripts para facilitar el desarrollo y despliegue:

#### Scripts disponibles

```bash
# Ver todas las opciones disponibles
.\scripts\build-help.ps1

# Build y deploy de TODOS los productos
.\scripts\quick-build.ps1

# Scripts específicos por producto (más rápido para desarrollo)
.\scripts\build-onboardingaudit.ps1
.\scripts\build-ignium.ps1
.\scripts\build-jobpulse.ps1
.\scripts\build-pulziohq.ps1
```

#### Ventajas del sistema de scripts

- **Desarrollo rápido**: Solo construyes el producto que modificaste
- **Deploy eficiente**: Menos tiempo de espera
- **Organización clara**: Scripts específicos por producto
- **Flexibilidad**: Puedes elegir qué construir

#### Orden de construcción

Los scripts siguen este orden optimizado:
1. **uaylabs** - Crea la estructura base del directorio `out`
2. **Producto específico** - Se exporta a `uaylabs/out/[producto]/`
3. **Deploy** - Sube todo a Firebase

### Firebase Hosting

Todos los productos se despliegan a Firebase Hosting bajo el mismo dominio:

```bash
# Construir y desplegar (usando scripts)
.\scripts\quick-build.ps1

# O manualmente
npm run deploy
```

### Configuración de rutas

Firebase está configurado para servir cada producto en su ruta correspondiente:
- `/` → UayLabs
- `/ignium/` → Ignium
- `/jobpulse/` → JobPulse
- `/pulziohq/` → PulzioHQ
- `/onboardingaudit/` → OnboardingAudit

### URLs de producción

- **UayLabs**: https://uaylabs.web.app
- **Ignium**: https://uaylabs.web.app/ignium
- **JobPulse**: https://uaylabs.web.app/jobpulse
- **PulzioHQ**: https://uaylabs.web.app/pulziohq
- **OnboardingAudit**: https://uaylabs.web.app/onboardingaudit

### Estructura de deployment

```
firebase.json
├── hosting
│   └── uaylabs
│       └── public: "frontends/uaylabs/out"
│           └── rewrites
│               ├── "/ignium/**" → "/ignium/index.html"
│               ├── "/jobpulse/**" → "/jobpulse/index.html"
│               ├── "/pulziohq/**" → "/pulziohq/index.html"
│               ├── "/onboardingaudit/**" → "/onboardingaudit/index.html"
│               └── "**" → "/index.html"
```

## 📝 Convenciones

### Nomenclatura

- **Directorios**: kebab-case (`nuevo-producto`)
- **Componentes**: PascalCase (`NuevoProducto`)
- **Archivos**: kebab-case (`mi-componente.tsx`)

### Estructura de archivos

- Cada producto es completamente independiente
- Dependencias compartidas en `node_modules/`
- Configuración específica por producto
- Estilos con Tailwind CSS
- **Builds centralizados en `uaylabs/out/`**

### Git

- Cada producto puede tener su propio flujo de desarrollo
- Commits específicos por producto
- Tags por versión de producto

## 🔧 Troubleshooting

### Problemas comunes

1. **Error de dependencias**: Asegúrate de que `node_modules/` esté en el directorio `frontends/`
2. **Puerto ocupado**: Cambia el puerto en `package.json` scripts si es necesario
3. **Build errors**: Verifica que todos los archivos de configuración estén presentes
4. **Build no aparece en uaylabs/out**: Verifica que `distDir` esté configurado correctamente
5. **Estilos no se cargan**: Verifica que `assetPrefix: './'` y `basePath: ''` estén configurados

### Comandos útiles

```bash
# Limpiar cache de Next.js
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules && npm install

# Verificar estructura de builds
ls -la frontends/uaylabs/out/

# Construir todos los productos (usando scripts)
.\scripts\quick-build.ps1

# Construir producto específico
.\scripts\build-onboardingaudit.ps1
.\scripts\build-ignium.ps1
.\scripts\build-jobpulse.ps1
.\scripts\build-pulziohq.ps1

# Ver opciones disponibles
.\scripts\build-help.ps1
```

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

**Nota**: Esta arquitectura permite escalabilidad y mantenimiento independiente de cada producto, mientras mantiene las ventajas de las dependencias compartidas y un deployment centralizado. 