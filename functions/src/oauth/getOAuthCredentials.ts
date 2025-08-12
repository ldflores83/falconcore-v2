// functions/src/oauth/getOAuthCredentials.ts

import * as admin from 'firebase-admin';
import { decrypt } from '../utils/encryption';

export interface OAuthCredentials {
  clientId: string;
  projectId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  folderId?: string;
  email: string;
}

export const getOAuthCredentials = async (clientId: string): Promise<OAuthCredentials | null> => {
  try {
    const doc = await admin.firestore()
      .collection('oauth_credentials')
      .doc(clientId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    if (!data || !data.accessToken || !data.projectId || !data.email) {
      return null;
    }

    // Descifrar tokens después de leer
    const decryptedData = {
      ...data, // Ensure all original fields are carried over
      accessToken: await decrypt(data.accessToken),
      refreshToken: data.refreshToken ? await decrypt(data.refreshToken) : undefined
    } as any; // Cast to any to resolve linter errors temporarily

    // Verificar si el token ha expirado
    if (decryptedData.expiresAt && Date.now() > decryptedData.expiresAt) {
      // Intentar refresh del token
      const refreshedCredentials = await refreshOAuthToken(clientId, decryptedData);
      if (refreshedCredentials) {
        return refreshedCredentials;
      }
      return null;
    }

    return {
      clientId: decryptedData.clientId,
      projectId: decryptedData.projectId,
      accessToken: decryptedData.accessToken,
      refreshToken: decryptedData.refreshToken,
      expiresAt: decryptedData.expiresAt,
      folderId: decryptedData.folderId,
      email: decryptedData.email
    };

  } catch (error) {
    return null;
  }
};

const refreshOAuthToken = async (clientId: string, credentials: any): Promise<OAuthCredentials | null> => {
  try {
    if (!credentials.refreshToken) {
      return null;
    }

    // Aquí implementarías la lógica de refresh del token
    // Por ahora, simplemente retornamos null para forzar re-autenticación
    return null;

  } catch (error) {
    return null;
  }
}; 