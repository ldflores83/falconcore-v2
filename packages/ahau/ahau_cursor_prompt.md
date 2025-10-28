uilkdAHUA LANDING – CURSOR EXECUTION PROMPT (SPANISH, CONCISO Y ACCIONABLE)

Rol a asumir (Cursor):
- Senior Frontend Engineer + UI Motion para Next.js/Vite + Tailwind + Framer Motion.
- Objetivo: Implementar una landing funcional para Ahau con hero animado, secciones clave y formulario de waitlist (frontend).

Stack esperado:
- React 18+, TailwindCSS, Framer Motion, lucide-react.
- Hosting: Firebase Hosting (ya configurado).

Entregables en código (en orden):
1) Componente HeroAhau con auto-demo (3 fases: disperso → alineado → post final) – ya provisto (ajustar imports según ruta local).
2) Secciones nuevas: LogosStrip, FeatureGrid, HowItWorks, ToneTrainerTeaser, WaitlistForm, FAQ, Footer.
3) Página de landing que compone todo (Next.js: app/ahau/page.tsx o pages/ahau.tsx / Vite: src/pages/Ahau.tsx).
4) Estilos Tailwind (asegurar contenedores, colores, fondo, y glass).
5) Formulario de waitlist funcional en frontend conectado a los **endpoints existentes de la API** (`/api/waitlist`). Debe usar `fetch('/api/waitlist', { method: 'POST', body: JSON.stringify(data) })` con cabeceras apropiadas.

Rutas y estructura sugerida:
- /src/components/ahau/HeroAhau.tsx  (contiene también las secciones exportadas)
- /src/pages/ahau.tsx (Vite/SPA) o /app/ahau/page.tsx (Next.js)

Acciones a ejecutar (Cursor):
A) Crear el archivo de página que importe y componga las secciones en este orden:
   <HeroAhau />
   <LogosStrip />
   <FeatureGrid />
   <HowItWorks />
   <ToneTrainerTeaser />
   <WaitlistForm />
   <FAQ />
   <Footer />
   - Asegurar IDs #try-tone-trainer y #join-waitlist.
   - Añadir un fondo global con gradientes sutiles (como en Hero).

B) Verificar dependencias e instalar si faltan:
   npm i framer-motion lucide-react

C) Tailwind:
   - Confirmar que tailwind.config.{js,ts} incluye content de /src/**/*.{ts,tsx} o /app/**/*.{ts,tsx}.
   - Global CSS con @tailwind base; @tailwind components; @tailwind utilities.
   - Evitar estilos inline complejos que rompan el diseño responsive.

D) Accesibilidad y UX:
   - Contraste suficiente en textos sobre fondos translúcidos.
   - Botones con aria-labels cuando sea necesario.
   - <details> para FAQ accesible.

E) Preparación para backend (integración real):
   - En WaitlistForm: ya no solo stub. Implementar `onSubmit` que haga POST a `/api/waitlist` con email y rol.
   - Validaciones básicas: email requerido, rol opcional.
   - Manejar estado local de “loading” y “ok/error” con mensajes visuales.

F) Optimización y limpieza:
   - Evitar re-render innecesario en Hero (estados locales concisos).
   - Usar AnimatePresence únicamente donde haya transición de fases.
   - Revisar que no existan warnings de hydration (si Next.js).

G) Deploy (manual posteriormente):
   - firebase deploy --only hosting (si ya está configurado hosting y targets).

Notas de contenido (copys):
- Tono humano, directo, sin “AI‑ish” genérico.
- Headline: “El mensaje de tu liderazgo se dispersa… Ahau lo sincroniza.”
- Sub: “Alinea las voces de tu equipo directivo sin perder autenticidad…”
- Diferenciadores: tenant primero, draft neutral → voz personal, tone trainer, workflow simple, analytics esenciales, privacidad mínima.

Validación visual rápida:
- Hero: animación de 10s en bucle con barra de progreso.
- Secciones: tarjetas glass con bordes blancos/15 y fondo white/[0.06].
- CTA: “Probar Tone Trainer” y “Únete a la lista”.

Criterio de aceptación:
- La página compila sin errores, responsive y con interacciones fluidas.
- Los anchors funcionan y el formulario de waitlist usa el endpoint `/api/waitlist` correctamente.
- Código limpio y comentado para facilitar extensiones.

Si entiendes, ejecuta los pasos A–F generando los archivos indicados. Responde con los diffs o los archivos completos listos para pegar y compilar.