// src/firebase.ts

import * as admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';

let serviceAccount: any = null;
const secretPath = '/secrets/firebase-admin-key/latest';
if (existsSync(secretPath)) {
  try {
    serviceAccount = JSON.parse(readFileSync(secretPath, 'utf8'));
  } catch (err) {
    console.error('[firebase.ts] Error reading or parsing service account secret:', err);
  }
}

console.log('[firebase.ts] INICIO de inicialización');

if (!admin.apps.length) {
  admin.initializeApp(
    serviceAccount
      ? { credential: admin.credential.cert(serviceAccount), projectId: 'falconcore-v2' }
      : { projectId: 'falconcore-v2' }
  );
}

export const db = admin.firestore();
