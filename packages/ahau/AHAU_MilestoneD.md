# AHAU – Sprint 4 / Módulo D

## 🎯 Objetivo

Activar el **Content System v1**: perfiles de tono por líder, plantillas de post, flujo editorial (idea → draft → reviewed → approved) y calendario editorial. Entregable: flujo completo de generación con copiloto + revisión + calendarización.

---

## 🧭 Alcance técnico

1. **Tone Profiles v1**

   * Per-tenant y por líder.
   * Campos: `displayName`, `role`, `avatarUrl?`, `tone: {clarity, warmth, energy, sobriety}`, `dos/donts`, `samples`.
   * Usados en copiloto.

2. **Template Library v1**

   * Estructuras de post: "Opinion + Mini-case", "Myth vs Reality", etc.
   * Bloques: Hook / Insight / Example / CTA.
   * CRUD admin.

3. **Draft Pipeline**

   * Estados: `idea` → `draft` → `reviewed` → `approved`.
   * Campos extra: `ownerProfileId`, `status`, `review {reviewerUid, notes, reviewedAt}`.

4. **Content Calendar v1**

   * Vista semanal/mensual.
   * Slots: `{dateISO, time, ownerProfileId, draftId, status}`.
   * Export manual (CSV).

5. **Analytics (stub)**

   * Resumen: drafts por estado, por líder.

6. **Gamificación (semilla)**

   * Puntos por acciones: idea, draft, approve, schedule.
   * Streak semanal.

---

## 📂 Firestore – colecciones nuevas

* `tenants/{tenantId}/profiles/{profileId}`
* `tenants/{tenantId}/templates/{templateId}`
* `tenants/{tenantId}/drafts/{draftId}` (extensión con status/pipeline)
* `tenants/{tenantId}/calendar/{yyyy-mm}/{slotId}`
* `tenants/{tenantId}/points/{uid}/{week}`

---

## 🧱 Endpoints (Express /api/ahau)

* `GET /tenants/:tenantId/profiles` (member+)
* `POST /tenants/:tenantId/profiles` (admin)
* `PUT /tenants/:tenantId/profiles/:id` (admin)
* `GET /tenants/:tenantId/templates` (member+)
* `POST /tenants/:tenantId/templates` (admin)
* `POST /tenants/:tenantId/drafts/:id/review` (admin)
* `POST /tenants/:tenantId/calendar/schedule` (admin)
* `GET /tenants/:tenantId/metrics/summary` (member+)
* `POST /content/generate` (extender) body `{profileId, templateId}`

---

## 🖥️ Frontend (React + Tailwind)

**Páginas nuevas**

* `/ahau/profiles` – CRUD perfiles (admin).
* `/ahau/templates` – CRUD templates (admin).
* `/ahau/calendar` – calendario drag\&drop (admin), lectura members.

**Componentes**

* `ToneProfileForm`
* `TemplateCard`, `TemplateEditor`
* `DraftReviewPanel`
* `CalendarBoard`
* `PointsWidget`

**ContentCopilot**

* Extender con select `Profile` y `Template`.
* Botones: Generate, Save as Draft, Send to Review.

---

## 🔐 Firestore Rules (incremental)

```js
match /tenants/{tenantId} {
  match /profiles/{id} {
    allow read: if isSignedIn() && isTenantMember(tenantId);
    allow write: if isSignedIn() && isAdmin(tenantId);
  }
  match /templates/{id} {
    allow read: if isSignedIn() && isTenantMember(tenantId);
    allow write: if isSignedIn() && isAdmin(tenantId);
  }
  match /drafts/{id} {
    allow read, create, update: if isSignedIn() && isTenantMember(tenantId);
  }
  match /calendar/{ym}/{slotId} {
    allow read: if isSignedIn() && isTenantMember(tenantId);
    allow write: if isSignedIn() && isAdmin(tenantId);
  }
  match /points/{uid}/{week} {
    allow read: if isSignedIn() && isTenantMember(tenantId);
    allow write: if request.auth.uid == uid || isAdmin(tenantId);
  }
}
```

---

## 🧪 Pruebas de aceptación

1. Admin crea profile → copiloto genera post con tono aplicado.
2. Admin crea template → aparece en selector del Copiloto.
3. Member crea draft → Admin lo revisa y aprueba.
4. Admin calendariza draft aprobado → aparece en CalendarBoard.
5. Export calendario semanal a CSV.
6. Gamificación: puntos suman al crear/aprobar/schedule.

---

## 🧰 Checklist para Cursor

**Backend**

* [ ] Handlers profiles, templates, review, calendar, metrics.
* [ ] Extender generate con profileId/templateId.
* [ ] Firestore helpers (profiles, templates, setDraftStatus, scheduleSlot).

**Frontend**

* [ ] Páginas: Profiles, Templates, Calendar.
* [ ] Extender ContentCopilot.
* [ ] DraftReviewPanel.
* [ ] PointsWidget.
* [ ] Export CSV en Calendar.

**Rules**

* [ ] Actualizar reglas firestore.
* [ ] Semillas: templates base en `public/ahau/templates.json`.

---

## 🔧 Prompt engineering

* **system**: "You are a LinkedIn content assistant. Write professional posts (120–180 words), structure: Hook / Insight / Example / Closing. Use profile tone and template blocks."
* **user**: `{prompt}` + `{profile.tone}` + `{template.blocks}`.

---

## ✅ Criterio de cierre

* Admin crea perfil + template, member genera draft con copiloto.
* Admin revisa y aprueba, lo agenda en calendario.
* Export CSV funcional.
* Puntos se registran en Firestore.
