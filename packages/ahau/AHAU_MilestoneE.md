# 🏁 AHAU – Sprint 5 / Milestone E (Entrega Externa + Integraciones)

## 🎯 Objetivo Central

Pasar de un sistema cerrado de drafts a un **sistema vivo que publica, mide y notifica**. Este milestone abre la plataforma hacia el exterior mediante publicación en LinkedIn, métricas avanzadas, emails transaccionales y API pública inicial.

---

## 🔑 Bloques Principales

### 1. Integración con LinkedIn API (Publishing)

* Endpoint: `POST /api/ahau/publish`
* Flujo: Draft aprobado → opción “Publicar” → integración LinkedIn API (perfil personal / company page).
* Guardar `postId` en Firestore (`tenants/{tenantId}/posts/{postId}`).
* Tokens OAuth de LinkedIn gestionados por tenant (Secret Manager).
* Validación de permisos mínimos (`w_member_social`).

---

### 2. Métricas Avanzadas (Post-Impacto)

* Colección Firestore:

```typescript
 tenants/{tenantId}/posts/{postId} {
   draftId: string;
   linkedInId: string;
   impressions: number;
   likes: number;
   comments: number;
   shares: number;
   engagementRate?: number;
   createdAt: Timestamp;
   updatedAt: Timestamp;
 }
```

* Endpoints:

  * `GET /api/ahau/metrics/posts` → métricas por tenant
  * `GET /api/ahau/metrics/posts/:id` → métricas de un post específico
* Dashboard con gráficos:

  * Evolución de posts publicados
  * Comparativa por perfil de tono
  * ROI estimado del contenido

---

### 3. Emails Transaccionales

* Integrar SendGrid / Firebase Extensions.
* Emails básicos:

  * Invitación aceptada
  * Nuevo draft creado
  * Publicación programada hoy
* Configuración desde `TenantSettings`.

---

### 4. API Pública (fase inicial)

* Endpoints con API key por tenant (limitados a 100 req/día en MVP).
* Endpoints iniciales:

  * `POST /api/public/ahau/drafts.create`
  * `GET /api/public/ahau/drafts.list`
  * `POST /api/public/ahau/publish`
* Middleware: `verifyApiKey.ts`
* API keys generadas y rotadas desde `TenantSettings`.

---

### 5. Mejoras UX/UI

* **Calendario**: drag & drop para reprogramar publicaciones.
* **Dashboard**: estado visual de posts publicados (link a LinkedIn).
* **Notificaciones in-app**: toast + panel lateral de actividad reciente.

---

## ✅ Checklist de Validación

**Publicación LinkedIn**

* [ ] Crear draft → aprobar → publicar → validar post en LinkedIn.
* [ ] Guardar `postId` en Firestore.
* [ ] Validar que se use token correcto del tenant.
* [ ] Manejo de errores si el post falla.

**Métricas**

* [ ] `/metrics/posts` retorna métricas correctas.
* [ ] Gráficos en dashboard muestran evolución.
* [ ] Comparativa por perfil de tono visible.
* [ ] ROI calculado correctamente.

**Emails**

* [ ] Invitación → email recibido por nuevo usuario.
* [ ] Draft creado → admin recibe notificación.
* [ ] Email de recordatorio para publicaciones programadas.

**API Pública**

* [ ] Generar API key en `TenantSettings`.
* [ ] Crear draft vía `POST /api/public/ahau/drafts.create`.
* [ ] Límite de 100 requests/día funciona.
* [ ] Rotación de API keys probada.

**UX**

* [ ] Drag & drop en calendario actualiza Firestore.
* [ ] Estado visual de posts publicados con link activo.
* [ ] Notificaciones in-app aparecen en tiempo real.
* [ ] Panel lateral de actividad refleja cambios de drafts y publicaciones.

---

## 📦 Archivos Involucrados

**Backend (`functions/src/`):**

* `routes/ahau.ts` (nuevos endpoints)
* `middleware/verifyApiKey.ts`
* `products/ahau/helpers/linkedinClient.ts`

**Frontend (`frontends/ahau/`):**

* `pages/dashboard.tsx`
* `pages/calendar.tsx`
* `components/NotificationsPanel.tsx`
* `lib/api-fetch.ts`
* `context/NotificationsContext.tsx`

---

## 🔮 Preparación Milestone F

* Mobile app nativa (Expo / React Native).
* Copiloto persistente embebido (Yeka dentro de Ahau).
* Analytics multi-tenant avanzados.

---

**Estado:** 🟡 Planeación activa, pendiente de ejecución.
