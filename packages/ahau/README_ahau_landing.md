# Ahau Landing Page

Landing page moderna y funcional para Ahau, el producto de sincronización de liderazgo de UayLabs.

## 🎯 Características

### ✨ Componentes Principales

- **HeroAhau**: Sección hero con animación de 3 fases (disperso → alineado → post final)
- **LogosStrip**: Franja de logos de empresas que confían en la alineación de liderazgo
- **FeatureGrid**: Grid de características diferenciadoras del producto
- **HowItWorks**: Proceso paso a paso de cómo funciona Ahau
- **ToneTrainerTeaser**: Demostración interactiva del Tone Trainer
- **WaitlistForm**: Formulario funcional conectado a `/api/waitlist`
- **FAQ**: Preguntas frecuentes con acordeón interactivo
- **Footer**: Footer completo con enlaces y información de contacto

### 🎨 Diseño y UX

- **Responsive**: Diseño adaptativo para todos los dispositivos
- **Animaciones**: Transiciones fluidas con Framer Motion
- **Glass Morphism**: Efectos de cristal y transparencias
- **Gradientes**: Paleta de colores moderna y atractiva
- **Microinteracciones**: Hover effects y animaciones sutiles

### 🚀 Funcionalidades

- **Formulario de Waitlist**: Conectado a la API real
- **Navegación suave**: Scroll automático a secciones
- **Modal de éxito**: Feedback visual al unirse a la lista
- **SEO optimizado**: Meta tags y estructura semántica
- **Accesibilidad**: Contraste adecuado y navegación por teclado

## 🛠️ Tecnologías

- **Next.js 14**: Framework de React
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utilitarios
- **Framer Motion**: Animaciones
- **Lucide React**: Iconografía
- **Firebase Hosting**: Despliegue

## 📁 Estructura

```
ahau/
├── components/
│   ├── HeroAhau.tsx          # Hero con animación de 3 fases
│   ├── LogosStrip.tsx        # Franja de logos
│   ├── FeatureGrid.tsx       # Grid de características
│   ├── HowItWorks.tsx        # Proceso paso a paso
│   ├── ToneTrainerTeaser.tsx # Demo del Tone Trainer
│   ├── WaitlistForm.tsx      # Formulario de waitlist
│   ├── FAQ.tsx              # Preguntas frecuentes
│   └── Footer.tsx           # Footer
├── pages/
│   └── ahau.tsx             # Página principal
├── styles/
│   └── globals.css          # Estilos globales
└── build-and-deploy.ps1     # Script de build
```

## 🚀 Desarrollo

### Instalación

```bash
# Desde el directorio frontends
cd ahau
npm install
```

### Desarrollo local

```bash
npm run dev
```

### Build para producción

```bash
npm run build
# O usar el script
.\build-and-deploy.ps1
```

## 🎨 Personalización

### Colores

La paleta de colores está definida en `tailwind.config.js`:

- **Slate 900**: Fondo principal
- **Purple 900**: Acentos y gradientes
- **Gradientes**: Combinaciones de azul, púrpura, verde, amarillo, rojo

### Contenido

El contenido está hardcodeado en los componentes. Para personalizar:

1. **HeroAhau**: Modifica las fases en el array `phases`
2. **FeatureGrid**: Actualiza el array `features`
3. **HowItWorks**: Cambia los pasos en el array `steps`
4. **FAQ**: Modifica las preguntas en el array `faqs`

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid adaptativo**: Columnas que se ajustan según el tamaño de pantalla
- **Tipografía escalable**: Tamaños de texto responsivos

## 🔧 Configuración

### Next.js

```javascript
// next.config.js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: '../uaylabs/out/ahau',
  assetPrefix: './',
  basePath: '',
  images: {
    unoptimized: true
  }
}
```

### Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ... configuración extendida
}
```

## 🌐 Despliegue

### Firebase Hosting

```bash
# Desde el directorio raíz del proyecto
firebase deploy --only hosting
```

### URLs

- **Desarrollo**: `http://localhost:3000/ahau`
- **Producción**: `https://uaylabs.web.app/ahau`

## 📊 Performance

- **Lighthouse Score**: Optimizado para rendimiento
- **Lazy Loading**: Carga diferida de componentes
- **Image Optimization**: Imágenes optimizadas
- **Bundle Size**: Código minificado y optimizado

## 🐛 Troubleshooting

### Problemas comunes

1. **Error de compilación**: Verificar que todas las dependencias estén instaladas
2. **Estilos no se cargan**: Verificar configuración de Tailwind
3. **Animaciones no funcionan**: Verificar que Framer Motion esté instalado
4. **Formulario no envía**: Verificar que la API `/api/waitlist` esté disponible

### Comandos útiles

```bash
# Limpiar cache
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules && npm install

# Verificar build
npm run build

# Linting
npm run lint
```

## 📝 Notas de Desarrollo

### Animaciones

- **HeroAhau**: Ciclo de 10 segundos con barra de progreso
- **Framer Motion**: Usado para transiciones suaves
- **AnimatePresence**: Para transiciones de entrada/salida

### Formulario

- **Validación**: Email requerido, otros campos opcionales
- **Estados**: Loading, success, error
- **API**: Conectado a `/api/waitlist` con método POST

### SEO

- **Meta tags**: Título, descripción, Open Graph
- **Estructura semántica**: HTML5 semántico
- **Canonical URL**: URL canónica definida

## 🎯 Próximos Pasos

1. **A/B Testing**: Probar diferentes versiones del hero
2. **Analytics**: Integrar Google Analytics
3. **Hotjar**: Añadir mapas de calor
4. **Optimización**: Mejorar Core Web Vitals
5. **Internacionalización**: Soporte para múltiples idiomas

---

**Desarrollado por UayLabs** 🚀
