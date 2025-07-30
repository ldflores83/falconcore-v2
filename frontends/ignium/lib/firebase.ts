import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'falconcore-v2',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin
const apps = getApps();

if (!apps.length) {
  initializeApp({
    credential: cert(firebaseAdminConfig),
  });
}

const db = getFirestore();

export { db }; 