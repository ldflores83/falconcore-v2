🛠 Checklist Debug – OAuth OnboardingAudit
1. Validar el Rewrite en Firebase Hosting
📍 Archivo: firebase.json

json
Copiar
Editar
"rewrites": [
  {
    "source": "/onboardingaudit/api/**",
    "function": "api"
  }
]
✅ Acción:

Abre firebase.json y confirma que existe exactamente esa línea.

Haz firebase deploy --only hosting para aplicar cambios.

Test rápido:

ruby
Copiar
Editar
https://uaylabs.web.app/onboardingaudit/api/ping
→ Debe responder con el ping de tu función api.

2. Confirmar que el Router está registrado
📍 Archivo: functions/src/app.ts

Debe existir esto:

ts
Copiar
Editar
import { oauthRouter } from './oauth';

app.use('/api/oauth', oauthRouter);

// fallback directo por si el router falla
app.get('/oauth/callback', async (req, res) => {
  const { callback } = await import('./oauth/callback');
  return callback(req, res);
});
✅ Acción:

Abre functions/src/app.ts en Cursor y confirma que ambas líneas están presentes.

Si faltan, agrégalas.

3. Validar el Router OAuth
📍 Archivo: functions/src/oauth/index.ts

ts
Copiar
Editar
import { Router } from 'express';
import { login } from './login';
import { callback } from './callback';

const router = Router();

router.get('/login', login);
router.get('/callback', callback);

export const oauthRouter = router;
✅ Acción:

Asegúrate de que router.get('/callback', callback) está presente.

En Cursor: busca router.get('/callback') y corrige si no aparece.

4. Debug directo al Callback
Prueba este endpoint en navegador o curl:

bash
Copiar
Editar
https://us-central1-falconcore-v2.cloudfunctions.net/api/oauth/callback?code=TEST
✅ Acción:

Debe dar error de token inválido (OK).

Si da Cannot GET, el router no está enganchado → revisar orden de middlewares en app.ts.

5. Orden de Middlewares en Express
📍 Archivo: functions/src/app.ts

⚠️ Asegúrate de que el app.use('/api/oauth', oauthRouter) esté antes de cualquier middleware de fallback tipo app.use('*', handler) o app.get('*', ...).

Ejemplo correcto:

ts
Copiar
Editar
app.use('/api/oauth', oauthRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// catch-all al final
app.use('*', (_, res) => res.status(404).send('Not found'));
6. Redeploy Completo
Ejecuta:

powershell
Copiar
Editar
cd functions
npm run build
firebase deploy --only functions,hosting
✅ Acción:

Verifica en logs que la función api se redeploya.

Luego vuelve a probar el flujo desde:

arduino
Copiar
Editar
https://uaylabs.web.app/onboardingaudit/login
7. Validar Flujo Completo
Login desde frontend

Redirección → Google

Callback → tokens + carpeta en Drive

Firestore guarda datos.