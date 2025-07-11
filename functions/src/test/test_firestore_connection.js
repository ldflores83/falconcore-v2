/**
 * 🔍 Test de conexión con Firestore
 *
 * Este script verifica si la conexión con la base de datos Firestore
 * está funcionando correctamente mediante la creación de un documento
 * de prueba en la colección 'test'.
 *
 * Ejecutar con:
 * node src/test/test_firestore_connection.js
 */

const { db, admin } = require('../services/firebase');

async function testConnection() {
  try {
    console.log('🧪 db:', db);
    console.log('🧠 Firebase apps:', admin.apps);
    console.log('🔎 Proyecto detectado:', admin.app().options.credential.projectId || 'No definido');

    // Crear documento de prueba
    const docRef = db.collection('test').doc('conexion');
    await docRef.set({
      timestamp: new Date(),
      estado: 'ok'
    });

    console.log('✅ Conexión a Firestore exitosa. Documento creado.');
    setTimeout(() => process.exit(0), 100); // Espera para que el log se imprima
  } catch (error) {
    console.error('❌ Error al conectar con Firestore:', error);
    process.exit(1);
  }
}

testConnection();
