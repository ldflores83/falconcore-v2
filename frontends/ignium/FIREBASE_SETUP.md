# Firebase Admin SDK Setup for Ignium Waitlist

## 🔥 **Paso 1: Obtener Credenciales de Firebase**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `falconcore-v2`
3. Ve a **Project Settings** > **Service Accounts**
4. Haz clic en **Generate new private key**
5. Descarga el archivo JSON con las credenciales

## 📝 **Paso 2: Configurar Variables de Entorno**

Crea un archivo `.env.local` en la raíz del proyecto `frontends/ignium/` con el siguiente contenido:

```env
# Firebase Admin SDK Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=falconcore-v2
FIREBASE_PRIVATE_KEY_ID=tu_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTu private key aquí\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@falconcore-v2.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=tu_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40falconcore-v2.iam.gserviceaccount.com

# Email Configuration
ADMIN_EMAIL=tu_email@uaylabs.com

# Optional: SendGrid API Key (para servicio de email)
SENDGRID_API_KEY=tu_sendgrid_api_key
```

## 🔧 **Paso 3: Configurar Firestore**

1. En Firebase Console, ve a **Firestore Database**
2. Crea una nueva base de datos si no existe
3. En **Rules**, asegúrate de que las reglas permitan escritura desde el servidor:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /waitlist_ignium/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📧 **Paso 4: Configurar Email Service (Opcional)**

Para enviar emails reales, puedes integrar con:

### SendGrid
```bash
npm install @sendgrid/mail
```

### Resend
```bash
npm install resend
```

Luego actualiza `lib/email-service.ts` para usar el servicio elegido.

## 🚀 **Paso 5: Probar la Integración**

1. Ejecuta el proyecto en desarrollo:
```bash
npm run dev
```

2. Ve a `http://localhost:3000/ignium`
3. Completa el formulario de waitlist
4. Verifica en Firebase Console que los datos se guardaron
5. Revisa los logs del servidor para confirmar emails

## 📊 **Estructura de Datos en Firestore**

Los datos se guardan en la colección `waitlist_ignium` con la siguiente estructura:

```javascript
{
  email: "usuario@ejemplo.com",
  name: "Nombre del Usuario",
  language: "es" | "en",
  timestamp: "2024-01-01T00:00:00.000Z",
  source: "ignium-landing",
  status: "pending",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔍 **Monitoreo y Analytics**

- **Firebase Console**: Revisa los datos en tiempo real
- **Logs del servidor**: Monitorea errores y éxitos
- **Email tracking**: Verifica que los emails se envíen correctamente

## 🛠️ **Solución de Problemas**

### Error: "Firebase App named '[DEFAULT]' already exists"
- Esto es normal, la app se inicializa una sola vez

### Error: "Permission denied"
- Verifica las reglas de Firestore
- Asegúrate de que las credenciales sean correctas

### Error: "Invalid private key"
- Asegúrate de que el `FIREBASE_PRIVATE_KEY` incluya los saltos de línea `\n`

## 📈 **Próximos Pasos**

1. **Analytics**: Integrar Google Analytics para tracking
2. **A/B Testing**: Probar diferentes versiones del formulario
3. **Email Marketing**: Integrar con Mailchimp o similar
4. **CRM**: Conectar con un CRM para seguimiento de leads 