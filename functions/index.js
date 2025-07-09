// functions/index.js
//
// Punto de entrada principal de funciones en Falcon Core v2
// Aquí se registran y exportan todas las funciones disponibles en el backend.
// Modular y escalable. Cada módulo se importa desde su carpeta correspondiente.

// 📦 Importamos funciones de módulos
const { oauthLogin } = require('./auth/oauth_handler');

// 🧠 Firebase Functions SDK
const functions = require('firebase-functions');

// 🚀 Exportamos función HTTP pública para iniciar login OAuth
exports.oauthLogin = functions.https.onRequest(oauthLogin);

// 👉 En el futuro agregaremos más funciones como:
// exports.createReport = functions.https.onCall(createReport);
// exports.syncDrive = functions.pubsub.schedule('every 24 hours').onRun(syncDrive);
