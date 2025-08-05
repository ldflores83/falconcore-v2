# 🚀 Setup Completo: Cloud Storage + Secret Manager + Manejo de Adjuntos + Limpieza Automática

## 🎯 Objetivo
Configurar Cloud Storage con credenciales seguras (Secret Manager) para manejar:
- Formularios de OnboardingAudit
- Archivos adjuntos (imágenes, PDFs, etc.)
- Limpieza automática del bucket temporal cuando el admin procesa a Drive

Además, validar las APIs y métodos existentes en Falcon Core.

---

## 🛠 Paso 1. Crear Cuenta de Servicio en GCP
1. Ir a **IAM & Admin → Service Accounts** en Google Cloud Console.
2. Crear cuenta de servicio:
   - Nombre: `falconcore-storage-service`
   - ID sugerido: `falconcore-storage-sa`
3. Asignar roles:
   - **Storage Object Admin**
  
   - **Secret Manager Secret Accessor**
4. Generar **clave JSON** y descargarla.

---

## 🛠 Paso 2. Subir Clave a Secret Manager
1. Ir a **Security → Secret Manager**.
2. Crear secreto con nombre: `cloud-storage-key`.
3. Contenido: pega el JSON completo de la clave descargada.

---

## 🛠 Paso 3. Permisos al Secreto
1. En el secreto `cloud-storage-key`, abrir pestaña **Permisos**.
2. Agregar la cuenta de servicio de Firebase Functions:
   - Ejemplo: `firebase-adminsdk-xxxx@falconcore-v2.iam.gserviceaccount.com`
3. Rol: **Secret Manager Secret Accessor**.

---

## 🛠 Paso 4. Configuración en firebase.json
```json
"functions": {
  "source": "functions",
  "runtime": "nodejs20",
  "secrets": ["cloud-storage-key"]
}
```

---

## 🛠 Paso 5. Servicio de Storage

📍 `functions/src/services/storage.ts`
```ts
import { Storage } from '@google-cloud/storage';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export async function getStorage() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/YOUR_PROJECT_ID/secrets/cloud-storage-key/versions/latest',
  });

  const payload = version.payload?.data?.toString();
  if (!payload) throw new Error('No se pudo obtener cloud-storage-key');

  const keyFile = JSON.parse(payload);

  return new Storage({
    projectId: keyFile.project_id,
    credentials: {
      client_email: keyFile.client_email,
      private_key: keyFile.private_key,
    },
  });
}
```

---

## 🛠 Paso 6. Guardar Formulario + Adjuntos

📍 `functions/src/api/receiveForm.ts`
```ts
import multer from 'multer';
import { getStorage } from '../services/storage';
import { db } from '../services/firebase';

const upload = multer({ storage: multer.memoryStorage() });

export const receiveForm = [
  upload.array('attachments'),
  async (req, res) => {
    try {
      const storage = await getStorage();
      const bucket = storage.bucket('falconcore-onboardingaudit-uploads');

      const ref = await db.collection('onboardingaudit_submissions').add({
        ...req.body,
        status: 'pending',
        createdAt: new Date(),
      });

      const attachments = [];
      for (const file of req.files as Express.Multer.File[]) {
        const path = `attachments/${ref.id}_${file.originalname}`;
        await bucket.file(path).save(file.buffer, { contentType: file.mimetype });
        attachments.push(`gs://${bucket.name}/${path}`);
      }

      await ref.update({ attachments });

      return res.status(200).json({ success: true, id: ref.id });
    } catch (err) {
      console.error('Error en receiveForm:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
];
```

---

## 🛠 Paso 7. Procesar Submissions y Migrar Adjuntos a Drive

📍 `functions/src/api/admin/processSubmissions.ts`
```ts
import { getStorage } from '../services/storage';
import { db } from '../services/firebase';
import { generateDocuments } from './generateDocuments';
import { uploadAssets } from './uploadAssets';

export async function processSubmissions(req, res) {
  try {
    const storage = await getStorage();
    const bucket = storage.bucket('falconcore-onboardingaudit-uploads');

    const snapshot = await db.collection('onboardingaudit_submissions')
      .where('status', '==', 'pending').get();

    const results = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Generar documento principal
      const docs = await generateDocuments(data);
      const result = await uploadAssets(docs, req.clientId, req.projectId);

      // Subir adjuntos a Drive
      if (data.attachments && data.attachments.length) {
        for (const path of data.attachments) {
          const fileName = path.split('/').pop();
          const [file] = await bucket.file(path.replace(`gs://${bucket.name}/`, '')).download();

          await uploadAssets(
            { buffer: file, mimeType: 'application/octet-stream', fileName },
            req.clientId,
            req.projectId
          );

          // Borrar adjunto del bucket temporal
          await bucket.file(path.replace(`gs://${bucket.name}/`, '')).delete().catch(console.error);
        }
      }

      await db.collection('onboardingaudit_submissions').doc(doc.id).update({
        status: 'processed',
        driveFileId: result.fileId,
      });

      results.push({ id: doc.id, fileId: result.fileId });
    }

    return res.status(200).json({ success: true, processed: results });
  } catch (err) {
    console.error('Error en processSubmissions:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
```

---

## 🛠 Paso 8. Tests con curl

### Enviar formulario con adjuntos
```bash
curl -X POST https://us-central1-falconcore-v2.cloudfunctions.net/api/onboardingaudit/public/receiveForm   -F "name=Test User"   -F "email=test@example.com"   -F "attachments=@/path/to/file1.png"   -F "attachments=@/path/to/file2.pdf"
```

### Procesar submissions pendientes
```bash
curl -X POST https://us-central1-falconcore-v2.cloudfunctions.net/api/onboardingaudit/admin/processSubmissions
```

---

## 🛠 Paso 9. Deploy
```bash
cd functions
npm run build
firebase deploy --only functions
```

---

## ✅ Resultado Final
- Formularios + adjuntos siempre se guardan, incluso sin OAuth activo.
- Metadata + paths de adjuntos registrados en Firestore.
- Admin con OAuth procesa submissions → genera documento + migra adjuntos a Drive.
- Limpieza automática del bucket temporal después de procesar.
- Siempre dentro del Free Tier gracias a la limpieza continua.
