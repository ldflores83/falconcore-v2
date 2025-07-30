# ✅ Prompt completo para Cursor – Ignium Landing (Next.js + Tailwind + Firestore)

## 🎯 Objetivo:
Crea desde cero un proyecto **Next.js** (TypeScript) dentro de `/frontends/ignium/`, con:

- Landing page modular para el producto **Ignium**
- Diseño tech-dark inspirado en copilotos inteligentes
- Registro funcional a una waitlist con Firestore
- Feedback visual al registrarse
- Uso de TailwindCSS para estilos

---

## 🧱 Estructura esperada del proyecto:

```
/frontends/ignium/
├── public/
│   ├── logo.svg
│   ├── yeka.png
├── pages/
│   ├── index.tsx                  // Landing principal
│   └── api/
│       └── waitlist.ts            // API endpoint para guardar correos
├── components/
│   ├── HeroSection.tsx
│   ├── WhatIsIgnium.tsx
│   ├── BuiltForYouIf.tsx
│   ├── WhatCanItDo.tsx
│   ├── PostLaunchAndTech.tsx
│   └── FinalCTA.tsx
├── styles/
│   └── globals.css
├── lib/
│   └── firebase.ts                // Configuración Firestore
├── .env.local                     // Para variables de Firebase
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

---

## 🔧 Instalación esperada:

Instala todo lo necesario:

```bash
npx create-next-app@latest ignium --typescript
cd ignium
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configura Tailwind según documentación: actualiza `globals.css`, `tailwind.config.js`.

---

## ✍️ Contenido real de la landing:

Utiliza estos bloques como componentes JSX en `/components` y combínalos en `pages/index.tsx`.

Incluye los bloques ya definidos:

- HeroSection
- WhatIsIgnium
- BuiltForYouIf
- WhatCanItDo
- PostLaunchAndTech
- FinalCTA

Con textos reales, JSX modular, y clases Tailwind. Usa estructura móvil primero, fondo oscuro, y acento naranja.

---

## 🔐 Funcionalidad esperada del botón “Join the waitlist”:

- En `FinalCTA`, agrega un input para capturar email y un botón que hace POST a `/api/waitlist`
- Validar que el email sea válido antes de enviar
- Mostrar feedback: ✅ success, ❌ error, “Saving...” al enviar

---

## 🔥 Firestore:

En `lib/firebase.ts`, inicializa Firebase Admin SDK con claves desde `.env.local`

En `/pages/api/waitlist.ts`:

- Recibe el email
- Guarda en la colección `waitlist_ignium` con campos: `{ email, createdAt }`
- Devuelve JSON con estado ok/error

---

## 📁 Variables de entorno necesarias:

En `.env.local`:

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## ✅ Estilos visuales clave:

- Fondo general: `bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]`
- Texto: blanco y gris claro
- Botones: `bg-orange-500 hover:bg-orange-600`
- Padding generoso (`py-20`, `gap-12`)
- Tipografía moderna: `font-sans`
- Responsive desde el inicio

---

## 🧠 Resultado final deseado:

Un proyecto funcional, modular y limpio con:

- Landing completa en `/`
- Waitlist funcional vía API + Firestore
- Código listo para deploy en Firebase Hosting si se desea

✨ Usa los nombres exactos. Usa el contenido real. Evita dejar bloques vacíos. Prioriza claridad modular y estilo consistente.
