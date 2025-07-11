import { db } from '../services/firebase.js';

async function readLogs() {
  try {
    const snapshot = await db.collection('logs').get();
    
    if (snapshot.empty) {
      console.log('⚠️ No se encontraron documentos en la colección "logs".');
    } else {
      snapshot.forEach(doc => {
        console.log(`📝 Documento: ${doc.id}`, doc.data());
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error leyendo la colección logs:', error);
    process.exit(1);
  }
}

readLogs();
