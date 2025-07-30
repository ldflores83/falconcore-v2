import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase Admin SDK configuration
let serviceAccount;

try {
  // Usar solo variables de entorno, no archivos de credenciales
  console.log('Using environment variables for Firebase configuration');
  serviceAccount = {
    type: process.env.FIREBASE_TYPE || 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID || 'falconcore-v2',
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
    client_id: process.env.FIREBASE_CLIENT_ID || '',
    auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || '',
  };
} catch (error) {
  console.error('Error configuring Firebase Admin:', error);
  // Fallback básico
  serviceAccount = {
    project_id: 'falconcore-v2'
  };
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
    projectId: serviceAccount.project_id || 'falconcore-v2',
  });
}

export const adminDb = getFirestore();

// Waitlist collection reference
export const waitlistCollection = adminDb.collection('waitlist_ignium'); 