// functions/auth/oauth_handler.js
//
// Función encargada de iniciar el flujo OAuth con Google.
// Genera una URL de autorización para que el usuario otorgue acceso.
// En el Sprint 1 también manejaremos el callback (code -> access_token).

import { google } from 'googleapis';

// 📎 Valores de configuración (temporal: luego irá desde Firestore o config segura)
const CLIENT_ID = 'TU_CLIENT_ID_AQUÍ';
const CLIENT_SECRET = 'TU_CLIENT_SECRET_AQUÍ';
const REDIRECT_URI = 'http://localhost:3000/oauth/callback';  // Placeholder

// 🧠 Creamos cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// 🔗 Función que genera y responde con la URL de login
export const oauthLogin = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });

  res.status(200).send(`🔐 Inicia sesión con Google: <a href="${authUrl}">Login</a>`);
};
