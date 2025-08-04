// functions/src/firebase.ts

import * as admin from 'firebase-admin';

// Inicializar Firebase Admin SDK si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'falconcore-v2',
    // No especificar credential para usar la autenticación por defecto
    // que funciona mejor con OAuth
  });
}

// Exportar instancia de Firestore
export const db = admin.firestore(); 