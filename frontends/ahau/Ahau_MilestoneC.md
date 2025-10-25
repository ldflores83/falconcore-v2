# AHAU – Sprint 3 / Módulo C

## 🎯 Objetivo

Construir la **primera versión funcional del copiloto de contenido dentro del dashboard**, con **gestión básica de tenant y usuarios**, sobre la base ya creada del Milestone A (auth + createTenant + dashboard shell).

---

## 🧭 Alcance técnico del sprint

1. **Tenant Settings iniciales**

   * UI dentro del dashboard para editar: `tenantName`, `logoUrl`, `primaryTopic` (tema/área estratégica), `about` (opcional).
   * Persistencia: `firestore/tenants/{tenantId}/settings` (doc único `default`).
2. **Gestión de usuarios (mínima)**

   * Listado de miembros del tenant con campos: `email`, `displayName`, `role ∈ {admin, member}`, `createdAt`.
   * Invitar por email (MVP): crear registro pendiente y permitir alta mediante `Add by email` (sin correo transaccional por ahora).
   * Endpoints con autorización por rol.
3. **Copiloto de contenido (v0)**

   * Componente `ContentCopilot` en `/dashboard` con input: *"Generate a LinkedIn post about \[topic]"*.
   * POST a `/api/ahau/content/generate` que llama OpenAI (using Secret Manager—**no .env**), con contexto mínimo: `tenant.settings.primaryTopic`.
   * Render de respuesta en editor simple (textarea/markdown preview) con botones **Copy** y **Save draft**.
   * Persistir drafts en `tenants/{tenantId}/drafts/{draftId}`.
4. **Infra/Security**

   * Middleware `verifyFirebaseIdToken` ya existe → agregar `enforceTenantMembership(tenantId)` y guardas de rol `requireAdmin`.
   * Firestore Security Rules iniciales para colecciones nuevas.
   * Cerrar el circuito: sólo miembros del tenant pueden leer/escribir sus settings, members y drafts. Sólo admins pueden invitar/editar settings.

---

## 📂 Estructura esperada (monorepo FalconCore)

```
functions/
  src/
    api/
      ahau/
        index.ts                 # router base /api/ahau
        middleware/
          auth.ts                # verifyFirebaseIdToken, enforceTenantMembership, requireAdmin
        handlers/
          tenants.settings.ts    # get/update settings
          tenants.members.ts     # list, invite, updateRole
          content.generate.ts    # POST /content/generate
        services/
          openai.ts              # wrapper de OpenAI vía Secret Manager
          firestore.ts           # helpers typed
        types/
          index.ts
frontends/ahau/
  src/
    context/AuthContext.tsx
    components/
      TenantSettingsForm.tsx
      MembersTable.tsx
      InviteMemberDialog.tsx
      ContentCopilot.tsx
      DraftCard.tsx
    pages/
      Dashboard.tsx
      Settings.tsx
      Members.tsx
      Drafts.tsx
    routes/
      ProtectedRoute.tsx
  public/ahau/config.json        # keys públicas; secretos siguen en Secret Manager
```

---

## 🔐 Firestore: colecciones y documentos

**1) Settings**

* Path: `tenants/{tenantId}/settings/default`
* Campos:

  * `tenantName: string`
  * `logoUrl: string|null`
  * `primaryTopic: string`
  * `about: string|null`
  * `updatedAt: Timestamp`
  * `updatedBy: string (uid)`

**2) Members**

* Path: `tenants/{tenantId}/members/{uidOrEmailHash}`
* Campos:

  * `email: string`
  * `displayName: string|null`
  * `role: 'admin'|'member'`
  * `status: 'active'|'invited'`
  * `createdAt: Timestamp`
  * `createdBy: string (uid)`

**3) Drafts**

* Path: `tenants/{tenantId}/drafts/{draftId}`
* Campos:

  * `title: string`
  * `content: string` (markdown o plain text)
  * `topic: string` (default: settings.primaryTopic)
  * `createdAt: Timestamp`
  * `createdBy: string (uid)`
  * `updatedAt: Timestamp`

---

## 🧱 Endpoints (Express en `functions`) – `/api/ahau`

> Todos detrás de `verifyFirebaseIdToken` + `enforceTenantMembership` salvo donde se indique.

### `GET /tenants/:tenantId/settings`

* Auth: member+
* Return: settings `default` o shape vacío por defecto.

### `PUT /tenants/:tenantId/settings`

* Auth: **admin**
* Body: `{ tenantName, logoUrl, primaryTopic, about }`
* Upsert en `settings/default` + `updatedAt/updatedBy`.

### `GET /tenants/:tenantId/members`

* Auth: **admin** (para ver roles/emails)
* Return: array de miembros.

### `POST /tenants/:tenantId/members/invite`

* Auth: **admin**
* Body: `{ email, role }`
* Crea/actualiza doc `status='invited'`.
* (Futuro: email transaccional.)

### `PATCH /tenants/:tenantId/members/:memberId`

* Auth: **admin**
* Body: `{ role? }`

### `POST /content/generate`

* Auth: member+
* Body: `{ tenantId, prompt, topic? }`
* Flujo:

  1. Lee `settings.primaryTopic`.
  2. Construye system & user prompts mínimos.
  3. Llama `services/openai.generateLinkedInPost()`.
  4. Devuelve `{ text }`.

### `POST /tenants/:tenantId/drafts`

* Auth: member+
* Body: `{ title, content, topic? }`
* Crea draft.

### `GET /tenants/:tenantId/drafts`

* Auth: member+
* Query: `limit?`

---

## 🧩 Middleware y helpers (functions)

**`middleware/auth.ts`**

* `verifyFirebaseIdToken(req,res,next)` – existente; usar.
* `enforceTenantMembership(req,res,next)` – valida que `req.user.uid` esté en `tenants/{tenantId}/members` con `status in {'active','invited'}`.
* `requireAdmin(req,res,next)` – role === 'admin'.

**`services/openai.ts`**

* Usa Secret Manager (p. ej., `OPENAI_API_KEY`) → **no .env**.
* `generateLinkedInPost({ topic, prompt, tenantName }): Promise<string>` – prompt engineering mínimo, rechazo de PII, longitud 120–180 palabras, formato markdown.

**`services/firestore.ts`**

* Helpers typed para `getTenantSettings`, `listMembers`, `upsertSettings`, etc.

---

## 🖥️ Frontend (React + Tailwind)

**Rutas**

* `/ahau/dashboard` → muestra `ContentCopilot` y últimos 3 drafts.
* `/ahau/settings` → `TenantSettingsForm` (sólo admin; usar `AuthContext.userRole`).
* `/ahau/members` → `MembersTable` + `InviteMemberDialog` (sólo admin).
* `/ahau/drafts` → listado de drafts con `DraftCard`.

**Componentes**

* `ContentCopilot`

  * Textarea prompt, select `topic` (default `primaryTopic`), botón **Generate**.
  * Muestra resultado en panel con acciones **Copy** y **Save Draft**.
* `TenantSettingsForm`

  * Inputs: name, logo, primaryTopic, about; botón **Save**.
* `MembersTable`

  * Tabla con email, role, status, fecha; `Change role` (admin ↔ member).
* `InviteMemberDialog`

  * Input email, select role; `Invite` → hit endpoint.
* `DraftCard`

  * Render markdown simple + acciones (futuro: export/share).

**Context**

* `AuthContext`: ya existente; extender con `currentTenantId`, `userRole`, `isAdmin`.
* `useTenant()` hook para fetch settings + memo.

**UI/UX**

* Mantener estética limpia (rounded-2xl, sombras suaves, grid). Botones primarios/ secundarios.

---

## 🛡️ Firestore Security Rules (mínimas para el sprint)

> Ajustar el archivo de reglas activo en el proyecto. Se asume colección `tenants` como raíz.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }

    function isTenantMember(tenantId) {
      return exists(/databases/$(database)/documents/tenants/$(tenantId)/members/$(request.auth.uid));
    }

    function isAdmin(tenantId) {
      return get(/databases/$(database)/documents/tenants/$(tenantId)/members/$(request.auth.uid)).data.role == 'admin';
    }

    match /tenants/{tenantId} {
      // Settings
      match /settings/{docId} {
        allow read: if isSignedIn() && isTenantMember(tenantId);
        allow write: if isSignedIn() && isAdmin(tenantId);
      }

      // Members
      match /members/{memberId} {
        allow read: if isSignedIn() && isAdmin(tenantId);
        allow write: if isSignedIn() && isAdmin(tenantId);
      }

      // Drafts
      match /drafts/{draftId} {
        allow read, create, update: if isSignedIn() && isTenantMember(tenantId);
        allow delete: if false; // deshabilitado en v0
      }
    }
  }
}
```

---

## 🧪 Pruebas de aceptación (end‑to‑end)

1. **Settings**

* Dado `admin` autenticado → abre `/ahau/settings` → edita `tenantName` y `primaryTopic` → guarda → Firestore escribe en `settings/default` con `updatedAt`/`updatedBy` y UI muestra toast de éxito.

2. **Members**

* Dado `admin` → abre `/ahau/members` → invita `user@example.com` como `member` → Firestore crea doc `status='invited'`.
* Cambia rol de un miembro a `admin` → endpoint responde 200 → Firestore refleja `role='admin'`.

3. **Copiloto**

* Dado `member` → en `/ahau/dashboard` ingresa prompt y presiona **Generate** → backend consulta `primaryTopic` y responde texto → UI renderiza.
* Presiona **Save Draft** → crea `draft` con `topic` default y lo muestra en `/ahau/drafts`.

4. **Reglas**

* Usuario `member` intenta acceder a `/ahau/members` → redirige/deniega.
* Usuario no‐miembro intenta golpear `/api/ahau/tenants/{X}/settings` → 403.

---

## 🧰 Tareas para Cursor (checklist de implementación)

**Backend**

* [ ] Crear router `functions/src/api/ahau/index.ts` y montar subrutas.
* [ ] Implementar `middleware/auth.ts`: `enforceTenantMembership`, `requireAdmin`.
* [ ] Implementar handlers `tenants.settings.ts`, `tenants.members.ts`, `content.generate.ts`.
* [ ] Implementar `services/openai.ts` (usar Secret Manager: `OPENAI_API_KEY`).
* [ ] Implementar `services/firestore.ts` con helpers typed.
* [ ] Exportar router en `functions/src/api/index.ts` si no existe.
* [ ] Asegurar logs claros y manejo de errores (try/catch + `res.status(4xx/5xx)`).

**Frontend**

* [ ] Crear páginas `/ahau/dashboard`, `/ahau/settings`, `/ahau/members`, `/ahau/drafts`.
* [ ] Implementar `ContentCopilot`, `TenantSettingsForm`, `MembersTable`, `InviteMemberDialog`, `DraftCard`.
* [ ] Extender `AuthContext` con `userRole` y `currentTenantId`.
* [ ] Implementar `ProtectedRoute` con verificación de rol cuando aplique.
* [ ] Integrar fetchers a endpoints (`fetchJSON`) y estados de carga/errores.

**Rules/Config**

* [ ] Actualizar Firestore Rules (sección arriba) y desplegar.
* [ ] Confirmar `public/ahau/config.json` con llaves públicas; secretos permanecen en Secret Manager.

**QA**

* [ ] Escribir pruebas manuales guiadas (sección de aceptación) y validar en una sesión de staging.

---

## 🔧 Comandos sugeridos

**Local**

```
firebase emulators:start --only functions,firestore,auth,hosting
```

**Deploy**

```
firebase deploy --only functions:api,hosting
```

> Mantener el router actual (función única `api`) por simplicidad. No mover secretos a `.env`.

---

## 🧱 Prompt engineering mínimo (backend `services/openai.ts`)

* **system**: "You are a concise content assistant that writes LinkedIn-ready posts (120–180 words), professional tone, clear structure: Hook / Development / Closing. Avoid hype and buzzwords. Consider the tenant’s primaryTopic as context."
* **user**: interpolar `{prompt}` del usuario y `{primaryTopic}` del tenant. Instruir: “output in markdown, no emojis, no hashtags”.

---

## 🗒️ Notas de diseño

* Sin `.env` en frontend: mantener `config.json` público para SDK; secretos en Secret Manager (backend).
* Mantener arquitectura modular para escalar a Sprint 4 (entrenamiento de tono + gamificación).
* Evitar dependencias nuevas pesadas; usar stack existente.

---

## ✅ Criterio de cierre del sprint

* Un admin puede configurar el tenant, invitar un miembro y ambos ya pueden generar y guardar drafts desde el dashboard.
* Reglas de Firestore bloquean accesos indebidos.
* No hay `.env` nuevos; OpenAI se resuelve por Secret Manager.
