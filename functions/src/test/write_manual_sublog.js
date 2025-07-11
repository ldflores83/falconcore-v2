import { db } from '../services/firebase.js';

async function writeSublog() {
  try {
    const time = new Date();

    const docRef = db
      .collection('logs')                     // Colección raíz
      .doc('manual_test')                    // Documento manual que creaste
      .collection('logs')                    // Subcolección dentro de ese doc
      .doc();                                // Nuevo documento con ID automático

    await docRef.set({
      type: 'test-sublog',
      action: 'write',
      origin: 'script',
      timestamp: time
    });

    console.log(`✅ Documento escrito en logs/manual_test/logs @ ${time.toISOString()}`);
  } catch (err) {
    console.error('❌ Error escribiendo subdocumento:', err);
  }
}

writeSublog();
