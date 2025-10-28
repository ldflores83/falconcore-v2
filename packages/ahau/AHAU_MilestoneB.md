
**Contexto base (no lo inventes, respétalo):**

* Proyecto: **AHAU** bajo el monorepo FalconCore/UayLabs.
* Milestone A listo: login + shell de dashboard + creación de tenant desde `/api/ahau/tenants.create`.
* Backend: `functions` con router `/api/ahau`, middleware `verifyFirebaseIdToken`, helper `makeTenantId`, `verifySession`.
* **Diseño clave**: SIN `.env` en frontend. Config pública via `/ahau/config.json` (loader en runtime). Secrets del backend en **Secret Manager**.
* Objetivo Sprint 2: Seguridad Firestore mínima + gestión de usuarios por tenant (roles) + dashboard navegable + **Content Drafts** MVP.

### Tareas (ordénalas y ejecútalas):

#### 1) Reglas de Firestore (aislamiento por tenant)

* Crear/actualizar archivo de reglas: `infra/firestore.rules` **o** donde ya las tengamos versionadas.
* Modelos esperados:

  * `tenants/{tenantId}`
  * `tenants/{tenantId}/users/{uid}`  (rol: `"admin"` | `"member"`)
  * `tenants/{tenantId}/drafts/{draftId}`
* Reglas (borrador, ajústalo si detectas rutas distintas):

  * Solo usuarios autenticados pueden leer/escribir dentro de SU `tenantId`.
  * Lectura/escritura de `tenants/{tenantId}`: permitir a usuarios que posean doc en `tenants/{tenantId}/users/{uid}`.
  * Solo **admin** puede crear/invitar usuarios y actualizar metadata del tenant (nombre/logo).
  * `drafts` visibles solo a miembros de ese `tenantId`.
* Entrega:

  * Archivo de reglas + script en `package.json` para desplegarlas (si no existe).
  * Changelog en commit.

#### 2) API backend – Users & Drafts

En `functions/src` (respeta la arquitectura y el router `/api/ahau`):

* **Middleware nuevo:** `verifyTenantAccess`

  * Lee `tenantId` desde el token o encabezado/param esperado.
  * Verifica en Firestore que `uid` ∈ `tenants/{tenantId}/users/{uid}`.
  * Adjunta `{tenantId, role}` a `req.context`.
* **Endpoints:**

  * `POST /api/ahau/users.invite`

    * Body: `{ tenantId, email }`
    * Solo **admin**.
    * Crea doc en `tenants/{tenantId}/users/` con `{ email, status: "invited", role: "member" }`.
    * (MVP) No enviar email real; solo registra invitación.
  * `GET /api/ahau/users.list?tenantId=...`

    * Restringido a miembros de ese tenant.
    * Retorna `[ { uid?, email, role, status } ]`.
  * `POST /api/ahau/users.acceptInvite`

    * Body: `{ tenantId }`
    * Para el usuario autenticado actual (`uid`, `email` de auth).
    * Marca/crea `tenants/{tenantId}/users/{uid}` con `{ email, role: "member", status: "active" }`.
  * `POST /api/ahau/tenant.update`

    * Body: `{ tenantId, name?, logoUrl? }`
    * Solo **admin**. Actualiza metadata.
  * `POST /api/ahau/drafts.create`

    * Body: `{ tenantId, title, content }`
    * Crea doc en `tenants/{tenantId}/drafts/{draftId}` con `{ title, content, createdBy, createdAt }`.
  * `GET /api/ahau/drafts.list?tenantId=...`

    * Lista drafts del tenant.
* Logs básicos en cada acción (usuario, acción, timestamp).
* Tests ligeros (si ya hay harness): validar 403 cuando uid/tenant no coinciden.

#### 3) Frontend – Dashboard mínimo con navegación

En `frontends/ahau` (o la ruta real que uses):

* Rutas protegidas:

  * `/ahau/dashboard` (layout con navbar, `ProtectedRoute` ya existe).
  * Subrutas:

    * `/ahau/dashboard/users`
    * `/ahau/dashboard/settings`
    * `/ahau/dashboard/content`
* **Navbar** persistente con tabs: Users / Settings / Content.
* **Loader de config**: Reusar el actual `/ahau/config.json`.
* **AuthContext**: Asegurar que exponga `currentUser`, `idToken`, y `activeTenantId`.
* **Users Page**:

  * Tabla con `email`, `role`, `status`.
  * Botón **Invite user** → modal simple (`email`) → `POST /api/ahau/users.invite`.
  * Botón **Accept invite** visible para invitado cuando entra con auth y selecciona `tenantId` (MVP: un dropdown si el usuario tiene varias invitaciones; si no, texto).
* **Settings Page**:

  * Form para `tenant.name` y `tenant.logoUrl`.
  * Save → `POST /api/ahau/tenant.update`.
  * Visible solo para admins (si `role !== "admin"`, deshabilitar y mostrar aviso).
* **Content Page**:

  * Sección **Drafts**:

    * Form simple: `title`, `content` (textarea).
    * Create → `POST /api/ahau/drafts.create`.
    * Lista de drafts con `title`, `createdBy`, `createdAt`.
* UI limpia con Tailwind; nada sofisticado. Componentes simples reutilizables (`Form`, `Modal`, `Table`).

#### 4) Autenticación – Google + Email/Password

* Asegura que el frontend soporte ambos flujos sin `.env`.
* En `README_frontend.md` agrega instrucciones para habilitar en Firebase Console:

  * Add `Google` y `Email/Password`.
  * Authorized domains: `localhost`, `uaylabs.web.app`, `ahau.io`.
* Ajusta flujo de signup/signin para que tras login:

  * Si no hay `tenantId` activo, ofrecer:

    * a) Crear tenant (si usuario no tiene ninguno).
    * b) Aceptar invitación (si detecta invitaciones pendientes).

#### 5) Tipos/Modelos y utilidades

* Crea/actualiza `types/ahau.ts` (o ubicación actual):

  ```ts
  export type Role = "admin" | "member";
  export interface Tenant { id: string; name: string; logoUrl?: string; createdAt: number; createdBy: string; }
  export interface TenantUser { uid: string; email: string; role: Role; status: "active" | "invited"; addedAt: number; }
  export interface Draft { id: string; title: string; content: string; createdBy: string; createdAt: number; }
  ```
* Helpers:

  * `getActiveTenantId()` desde contexto/sesión.
  * `apiFetch(path, options)` que adjunte `idToken` en `Authorization: Bearer ...`.

#### 6) Scripts y calidad

* `npm run lint` y `npm run build` limpios en frontend y functions.
* Agrega scripts:

  * `firebase:deploy:rules` → despliegue de reglas Firestore.
  * `deploy:ahau` → build + deploy hosting (solo frontend AHAU) + deploy functions `api` (si cambia).
* Actualiza `README_ahau.md` con:

  * Estructura de rutas
  * Endpoints añadidos
  * Cómo probar invites y aceptar invitación
  * Lista de verificación de seguridad

#### 7) Batería de pruebas (manuales, deja checklist en MD):

* **Reglas**:

  * Usuario A (admin) en `tenant X` NO puede leer/escribir `tenant Y`.
  * Usuario B (member) en `tenant X` NO puede actualizar `tenant X` settings.
* **Users**:

  * Admin invita `emailB`; B inicia sesión y **acceptInvite** en `tenant X` → queda `active`.
  * `users.list` muestra ambos con roles correctos.
* **Drafts**:

  * B crea draft en `tenant X` → aparece en `drafts.list` de X.
  * Usuario de `tenant Y` no ve drafts de X.
* **UI**:

  * Tabs muestran/ocultan acciones según rol.
  * Refresh conserva `activeTenantId` (sesión).
* **Auth**:

  * Login con Google y con Email/Password; ambos flujos funcionan en `localhost` y `uaylabs.web.app`.

### Entregables esperados

* Código de **functions** con endpoints nuevos y middleware `verifyTenantAccess`.
* Frontend con rutas `/users`, `/settings`, `/content` operativas.
* Reglas Firestore publicadas y documentadas.
* `README_ahau.md` actualizado (arquitectura y pruebas).
* Commits atómicos con mensajes claros por bloque.

### Restricciones y buenas prácticas (OBLIGATORIO)

* No introducir `.env` en frontend. Todo config público via `/ahau/config.json`.
* No romper Milestone A existente (creación de tenant post‑signup).
* Log mínima de auditoría (acción, uid, tenantId, timestamp) en cada endpoint.
* Tipos TS consistentes y reusables.
* Validar errores con respuestas JSON claras (`{ error: { code, message } }`).

**Al finalizar:**

* Ejecuta `npm run build` (frontend + functions) y corrige cualquier error.
* Deja un PR o commit con descripción: “AHAU Sprint 2 – Rules + Users/Roles + Drafts + Dashboard nav”.
* Escribe un `docs/ahau/sprint2_status.md` con el checklist de pruebas y estado final.

---

## Lo que yo haré en Firebase Console (para que lo documentes en el README y lo marques como “paso manual”)

1. Habilitar **Google** y **Email/Password** en Authentication.
2. Agregar `localhost`, `uaylabs.web.app`, `ahau.io` en **Authorized Domains**.
3. Publicar **Firestore Rules** (o correr `npm run firebase:deploy:rules` si ya dejaste script).
4. Verificar que las colecciones/paths creados coincidan con las reglas.

---

¿Algo más? Si detectas una ruta o nombre distinto en el repo actual, **ajusta el path y explica en el PR** por qué y cómo quedó. Mantén los cambios **modulares y revertibles**.
