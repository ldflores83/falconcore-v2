🛠 Checklist Debug – APIs de Formulario + Upload a Drive
1. Localiza el flujo de recepción del formulario
📍 Probablemente en:

functions/src/app.ts → app.use('/api/admin', adminRouter)

functions/src/admin/submissions.ts (o similar)

✅ Acción:

Abre adminRouter en Cursor y ubica el endpoint tipo:

ts
Copiar
Editar
router.post('/submissions', async (req, res) => {
   // procesar formulario
});
2. Confirma que recibe datos del frontend
📍 Frontend: frontends/onboardingaudit/pages/admin.tsx

Busca algo como:

ts
Copiar
Editar
await fetch('https://uaylabs.web.app/onboardingaudit/api/admin/submissions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});
✅ Debug rápido:

Inserta un console.log(req.body) al inicio del endpoint en backend.

Despliega y revisa logs (firebase functions:log) → confirma que los datos llegan.

3. Debug de integración con Google Drive
📍 Archivo: functions/src/storage/providers/GoogleDriveProvider.ts

Busca la función:

ts
Copiar
Editar
await drive.files.create({
  resource: fileMetadata,
  media: {
    mimeType: 'application/pdf', // o similar
    body: bufferStream
  },
  fields: 'id'
});
✅ Acción:

Si falla, revisa:

Que accessToken se está pasando desde el flujo OAuth (no caducó).

Que se use el folderId correcto (no "root").

Logs de error (console.error antes de lanzar excepción).

4. Verifica folderId post‑OAuth
Recuerda: desde el snapshot de 2.9 ya blindamos folderId.
📍 Confirma que en el callback se guarda correctamente en Firestore (o donde corresponda):

ts
Copiar
Editar
await saveToFirestore({
  clientId,
  projectId,
  folderId,
  tokens,
});
✅ Acción:

Haz un getDocument desde Firestore para ver si el folderId quedó registrado.

5. Prueba directa del endpoint
Haz un curl para validar sin frontend:

bash
Copiar
Editar
curl -X POST https://us-central1-falconcore-v2.cloudfunctions.net/api/admin/submissions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
✅ Esperado:

Respuesta 200 con { success: true }

Archivo creado en Drive.

6. Logs detallados
Usa:

bash
Copiar
Editar
firebase functions:log --only api
Busca errores tipo:

Invalid Credentials

Missing folderId

No such file or directory

UnhandledPromiseRejection

7. Escenario probable (según tu doc)
El frontend está pegando a /onboardingaudit/api/admin/submissions

Hosting → rewrite a api

api recibe pero no pasa correctamente accessToken o folderId → falla el upload.