
# 📌 Documento Vivo – Módulo: Auditoría de Onboarding + APIs FalconCore (MCP-Ready)

## 🎯 Descripción del Módulo

**Nombre:** Onboarding Audit  
**Objetivo:** Permitir a fundadores y equipos de producto identificar fricciones críticas en el flujo de registro y activación de usuarios mediante un cuestionario rápido.  
**Usabilidad:** Diseñado como un micro-módulo independiente dentro del ecosistema **UayLabs**, alojado en el subdirectorio `/onboardingaudit/`.

El módulo recolecta información clave a través de un formulario ligero, procesa los datos (semi-automatizado con copiloto humano), y entrega un reporte de 2–3 páginas creado en **Google Docs o Google Slides**, evitando depender de Notion y minimizando errores de formato.  
Las respuestas y archivos se guardan en carpetas dedicadas en Google Drive, organizadas por `projectId` y `clientId`.

---

## 🖌️ Estilos Sugeridos

- **Diseño:** limpio, minimalista, mobile-first  
- **Paleta:** tonos claros con acentos en azul y verde (claridad + acción)  
- **Tipografía:** Sans-serif (ej. Inter o Poppins)  
- **Botones:** grandes, redondeados, con CTA claros  
- **Estructura:** una sola columna, scroll ligero, máximo 3 pantallas  
- **CTA principal:** destacado en primer pliegue → "Start My Audit"  

---

## 📋 Cuestionario (Versión Final)

**Headline**  
*“Get your onboarding audit in 48 hours.”*

**Intro**  
We’ll review your signup flow and deliver a 2–3 page report with actionable recommendations.

### Section 1 – Product Basics
1. Product name  
2. Link to your signup or homepage  
3. Who is your target user? (Founders / Developers / SMBs / Consumers / Other)

### Section 2 – Current Onboarding Flow
4. How do new users sign up today? (Email & Password / Google / Invite-only / Other)  
5. What does the first-time experience look like? (Walkthrough / Empty state / Checklist / Other)  
6. Do you track drop-off points during onboarding? (Yes / No / Not sure)

### Section 2.5 – Optional: Help us see your flow
7. Do you have a way we can experience your onboarding as a test user?  
8. Provide login or signup instructions (optional)  
9. Do you send onboarding emails or social messages? (Email / Slack / Discord / None / Other)

### Section 3 – Goal & Metrics
10. Main goal for this audit (Activation / Conversion / Reduce churn / Other)  
11. Do you know your churn rate? (Yes / No / Not yet)  
12. When does churn usually happen? (24h / 1 week / 1 month / Longer / Not sure)  
13. Any specific concerns? (Open text)

### Section 4 – Delivery
14. Your email to send the report  
15. Preferred format: Google Doc / Google Slides

**Final Note:**  
*We’ll deliver your report with key insights and recommendations within 48 hours.*

---

## 🛠️ Usabilidad

- **Tiempo estimado de llenado:** 3–5 minutos  
- **Compatibilidad:** 100% responsive, optimizado para móvil  
- **Flujo de usuario:**
  1. Ingreso a `/onboardingaudit/`  
  2. Ve headline + CTA  
  3. Completa cuestionario sencillo (+ opción de subir screenshots)  
  4. Recibe confirmación instantánea en pantalla  
  5. Entrega del reporte en 48 horas vía Google Docs o Slides

- **Organización en Drive:**  
  Cada submission crea una carpeta única:  
  /FalconCore/{projectId}/{clientId}/submission_{timestamp}_{shortId}/
      form.docx
      img_1.png
      img_2.png

---

## 📊 Entregable

- Reporte de 2–3 páginas en **Google Docs o Google Slides**  
- Incluye: 3 fortalezas, 3 fricciones críticas, 3 recomendaciones accionables  
- Opcional: gráficos simples (drop-off estimado, journey simplificado)

---

## 🧩 Post-Entrega (Encuesta de Valor Percibido)

- *How valuable was this audit for you?* (Scale 1–5)  
- *If I told you it was assisted by AI, would you pay the same, more, or less?*  
- *What would make this worth $X for you?*  

---

## 🔌 APIs Públicas FalconCore (MCP-Ready)

### 📁 Estructura
/functions/src/api/public/
   ├─ receiveForm.ts
   ├─ uploadAsset.ts
   ├─ generateDocument.ts
   ├─ getUsageStatus.ts
   └─ utils/
       ├─ fileBuilder.ts
       ├─ driveUtils.ts
       ├─ response.ts
       └─ authUtils.ts

### Endpoints iniciales

#### /receiveForm
- Intake de formularios con `projectId` + `clientId`
- Crea carpeta por submission, sube `.docx` con respuestas, links a imágenes
- Retorna `submissionFolderId`, `formFileId`, `imageFileIds`

#### /uploadAsset
- Subida de archivos independientes (ej. CSV, PDFs)
- Carpeta de cliente dentro de su `projectId`

#### /generateDocument
- Generación de documentos desde un template
- Payload estructurado → `.docx` / `.pdf` en Drive

#### /getUsageStatus
- Monitoreo de límites (archivos/día, MB usados)
- Formato: { "filesUploaded": 2, "mbUsed": 35, "resetIn": "12h" }

#### (Opcional) /deleteSubmission
- Permite al cliente eliminar un submission completo (para privacidad / GDPR)

---

## 🔜 Próximos Pasos

1. Implementar módulo de APIs FalconCore (4 endpoints principales).  
2. Montar cuestionario en `/onboardingaudit/`.  
3. Conectar formulario → `receiveForm`.  
4. Validar subida de `.docx` e imágenes en carpetas por submission.  
5. Crear template del reporte en Google Docs/Slides.  
6. Publicar landing en comunidades (IndieHackers / LinkedIn / Reddit).
