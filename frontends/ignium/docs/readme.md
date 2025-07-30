
Este prompt actualiza por completo la landing del proyecto **Ignium**, usando **solo** la estructura, componentes y copys definidos aquí.

---

## 🎯 Objetivo

Actualizar la landing de **Ignium** ubicada en `/frontends/ignium/` para que siga esta estructura exacta:

- Framework: Next.js + TailwindCSS
- Estilo: dark mode, sobrio, tech
- Diseño: mobile-first, modular
- Contenido: usar solo los textos definidos aquí
- Estructura: cada sección vive en un componente dentro de `/components/`
- Página principal: `pages/index.tsx` que ensambla los componentes

---

## ⚠️ Reglas clave

- ❌ No inventes nuevos textos o secciones
- ✅ Usa el contenido textual y estructura visual exactamente como se indica
- ❌ No incluyas roadmap, blog, testimonios, secciones para developers, etc.
- ✅ Usa nombres exactos de archivos `.tsx`

---

## 📦 Estructura exacta de secciones (por componente)

---

### `HeroSection.tsx`

- Fondo: `bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]`
- Texto blanco, centrado
- Contenido:
  - Logo (`/logo.svg`)
  - Título: `Bring your loose idea to life`
  - Subtítulo: `No code. No team. No audience needed.`
  - Botón: `Join the waitlist` (color naranja)

---

### `WhatIsIgniumSection.tsx`

- Fondo: `#121212`
- Título: `What is Ignium?`
- Texto:
  `Ignium is your tactical copilot. It helps you structure your idea, take action, and get real feedback. Yeka, your conversational guide, helps activate the right modules at the right time.`
- Imagen: `/yeka.png`

---

### `BuiltForYouIfSection.tsx`

- Fondo: `#1a1a1a`
- Título: `Built for you if...`
- Lista:
  - You don’t know where to start
  - You're tired of theory and want action
  - You want to validate before you build
  - You work solo and want a system that supports you

---

### `WhatCanItDoSection.tsx`

- Fondo: `#0f0f1a`
- Título: `What can Ignium do?`
- Grilla responsive con los siguientes módulos:
  - 🧠 Yeka (your copilot)
  - 🧱 Mockup Generator
  - ✍️ Pitch Generator
  - 🧪 Validation Planner
  - 💬 Signal Collector
  - 📬 Inbox Sync
  - 📤 Asset Organizer
  - 📈 Traction Tracker

---

### `WhatHappensAfterLaunchAndTechSection.tsx`

- Fondo: `#121212`
- 2 columnas:

**Columna 1: What happens after launch?**

- Track signals from your inbox  
- Organize new insights  
- Iterate your proposal  
- Activate new campaigns  
- Generate new deliverables  

**Columna 2: How does it do that?**

- **MemorySync:** remembers your progress and context  
- **Multi-LLM Intelligence:** uses the best model for each task  
- **Modular architecture:** every action is a block  
- **Privacy-first:** you own your inbox and Drive  

---

### `FinalCTASection.tsx`

- Fondo: `#1a1a1a`, centrado
- Título: `Want to help shape Ignium?`
- Texto: `Be one of the first to try it and give feedback.`
- Botón: `Join the waitlist` (naranja)

---

## 📨 Waitlist funcional

- El botón “Join the waitlist” debe enviar un POST a `/api/waitlist.ts`
- Mostrar feedback visual:
  - “Saving...”
  - “✅ Registered”
  - “❌ Error”
- Ya existe `lib/firebase.ts` con lógica base
- El input debe validar que el correo sea válido

---

## ✅ Cierre

Aplica este layout sobre la estructura actual.  
No generes contenido nuevo.  
No omitas ni alteres los textos dados.  
No agregues otras secciones fuera de esta lista.
