// functions/index.js
//
// Punto de entrada principal de funciones en Falcon Core v2
// Aquí se registran y exportan todas las funciones disponibles en el backend.
// Modular y escalable. Cada módulo se importa desde su carpeta correspondiente.

// 🍰 Importamos funciones de módulos
import { oauthLogin } from './auth/oauth_handler.js';

// 🚀 Firebase Functions SDK
import functions from 'firebase-functions';

// 🌈 Exportamos funciones HTTP públicas
export const oauthLoginFn = functions.https.onRequest(oauthLogin);

// Importar getLogs
import { getLogs as getLogsHandler } from './getLogs.js';
export const getLogs = functions.https.onRequest(getLogsHandler);
