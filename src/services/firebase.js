console.log('⚡ firebase.js fue ejecutado');

const admin = require('firebase-admin');
const path = require('path');

console.log('🧠 Cargando serviceAccount...');
const serviceAccount = require(path.resolve(__dirname, '../../config/serviceAccountKey.json'));

console.log('🚀 Inicializando Firebase...');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('📦 Inicializando Firestore...');
const db = admin.firestore();

console.log('✅ Exportando db...');
module.exports = { db, admin };
