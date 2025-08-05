// test_pending.js
const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'falconcore-v2',
  });
}

const db = admin.firestore();

async function testPendingSubmissions() {
  try {
    console.log('🔍 Checking pending submissions in Firestore...');
    
    const snapshot = await db.collection('onboardingaudit_submissions')
      .where('status', '==', 'pending')
      .get();
    
    console.log('📋 Found submissions:', {
      total: snapshot.docs.length,
      submissions: snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }))
    });
    
    // También verificar todas las submissions
    const allSnapshot = await db.collection('onboardingaudit_submissions').get();
    console.log('📋 All submissions:', {
      total: allSnapshot.docs.length,
      submissions: allSnapshot.docs.map(doc => ({
        id: doc.id,
        status: doc.data().status,
        email: doc.data().email
      }))
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPendingSubmissions(); 