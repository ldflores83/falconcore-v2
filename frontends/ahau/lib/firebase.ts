import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { loadPublicConfig } from './public-config';

let appPromise: Promise<{ app: FirebaseApp }> | null = null;

export async function getFirebase() {
  if (!appPromise) {
    appPromise = (async () => {
      const cfg = await loadPublicConfig();
      const app = initializeApp(cfg);
      return { app };
    })();
  }
  return appPromise;
}

export async function getAuthClient() {
  const { app } = await getFirebase();
  return getAuth(app);
}

export const googleProvider = new GoogleAuthProvider();
