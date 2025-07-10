const { db, admin } = require('../services/firebase');

async function testConnection() {
  try {
    console.log('🧪 db:', db);
    console.log('🧠 Firebase apps:', admin.apps);
    console.log('🔎 Proyecto detectado:', admin.app().options.credential.projectId || 'No definido');

    const docRef = db.collection('test').doc('conexion');
    await docRef.set({
      timestamp: new Date(),
      estado: 'ok'
    });

    console.log('✅ Conexión a Firestore exitosa. Documento creado.');
    setTimeout(() => process.exit(0), 100); // le da tiempo al log de imprimirse
  } catch (error) {
    console.error('❌ Error al conectar con Firestore:', error);
    process.exit(1);
  }
}

testConnection();
