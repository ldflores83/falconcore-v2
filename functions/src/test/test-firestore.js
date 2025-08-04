// functions/src/test/test-firestore.js

const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'falconcore-v2'
  });
}

const db = admin.firestore();

async function testFirestore() {
  try {
    console.log('🔍 Verificando datos en Firestore...');
    
    // Verificar colección onboarding_audits
    const submissionsSnapshot = await db.collection('onboarding_audits').get();
    
    console.log(`📊 Total de submissions: ${submissionsSnapshot.size}`);
    
    if (submissionsSnapshot.size > 0) {
      console.log('\n📝 Últimas submissions:');
      submissionsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ID: ${doc.id}`);
        console.log(`  Email: ${data.email}`);
        console.log(`  Producto: ${data.productName}`);
        console.log(`  Fecha: ${data.createdAt?.toDate?.() || data.timestamp}`);
        console.log(`  Estado: ${data.status}`);
        console.log('---');
      });
    }
    
    // Verificar colección users
    const usersSnapshot = await db.collection('users').get();
    console.log(`👥 Total de usuarios: ${usersSnapshot.size}`);
    
    if (usersSnapshot.size > 0) {
      console.log('\n👤 Usuarios con submissions:');
      for (const userDoc of usersSnapshot.docs) {
        const userSubmissions = await userDoc.ref.collection('submissions').get();
        console.log(`- ${userDoc.id}: ${userSubmissions.size} submissions`);
      }
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testFirestore().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { testFirestore }; 