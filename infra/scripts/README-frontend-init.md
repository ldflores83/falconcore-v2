
# 🧭 FalconCore Frontend Init Scripts

Este directorio contiene scripts PowerShell para inicializar frontends por producto en FalconCore.

---

## 📜 `init-frontend.ps1` – Modo Robusto

Crea un frontend **completo** para productos con UI y flujo de rutas.

### Incluye:
- Carpeta `products/{ProductName}/web`
- Vite + React + TypeScript
- Tailwind + PostCSS configurados sin CLI
- Estructura React con:
  - `main.tsx`, `App.tsx`
  - Páginas: `Landing.tsx`, `Success.tsx`, `Logout.tsx`
- Soporte para enrutamiento (`react-router-dom`)

### ¿Cuándo usarlo?
- MVPs con login visual o flujos OAuth (ej. `ideasync`, `clientpulse`)
- Frontends que mostrarán confirmación o navegación

---

## 🧼 `init-frontend-light.ps1` – Modo Minimalista

Crea solo el setup base con Vite + Tailwind, sin rutas ni estructura de páginas.

### Incluye:
- Carpeta `products/{ProductName}/web`
- Vite + React + TypeScript
- Tailwind + PostCSS configurados manualmente
- `index.css` listo

### ¿Cuándo usarlo?
- Herramientas internas
- Frontends muy simples o temporales
- MVPs que no necesitan vistas complejas

---

## 🧠 Notas

- Ambos scripts evitan el uso de `npx tailwindcss init -p`
- Son 100% compatibles con Windows y PowerShell
- Eliminan problemas con `.bin` y builds rotos

