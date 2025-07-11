// src/core.js
import { db } from './services/firebase.js';

async function main() {
  try {
    const time = new Date();
    console.log('🚀 Falcon Core v2 iniciando...');

    await db.collection('logs').add({
      type: 'system',
      action: 'boot',
      status: 'ok',
      timestamp: time
    });

    console.log(`✅ Documento escrito en Firestore: logs/ (boot) @ ${time.toISOString()}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en servidor base:', err);
    process.exit(1);
  }
}

main();

