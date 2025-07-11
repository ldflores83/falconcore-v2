import { db } from '../services/firebase.js';

async function readManualSublog() {
  try {
    const snapshot = await db
      .collection('logs')
      .doc('manual_test')
      .collection('logs')
      .get();

    if (snapshot.empty) {
      console.log('⚠️ No hay documentos en logs/manual_test/logs');
    } else {
      snapshot.forEach(doc => {
        console.log(`📝 Subdocumento: ${doc.id}`, doc.data());
      });
    }
  } catch (error) {
    console.error('❌ Error leyendo subcolección:', error);
  }
}

readManualSublog();
