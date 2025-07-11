// src/services/firebase.js
import admin from 'firebase-admin';
import serviceAccount from '../../config/serviceAccountKey.json' assert { type: 'json' };

if (!admin.apps.length) {
  console.log('🧠 Cargando serviceAccount...');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('🚀 Inicializando Firebase...');
}

const db = admin.firestore();
console.log('📦 Inicializando Firestore...');

export { admin, db };
