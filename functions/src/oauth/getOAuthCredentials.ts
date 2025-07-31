import { db } from "../firebase";

export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  folderId: string;
  updatedAt: Date;
}

export const getOAuthCredentials = async (userId: string, projectId: string): Promise<OAuthCredentials | null> => {
  try {
    const docRef = db.collection("oauthData").doc(`${userId}_${projectId}`);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    return {
      accessToken: data?.accessToken,
      refreshToken: data?.refreshToken,
      expiresAt: data?.expiresAt,
      folderId: data?.folderId,
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    };
  } catch (err) {
    console.error('[getOAuthCredentials] Firestore read error:', err);
    throw err;
  }
};

export const getValidAccessToken = async (userId: string, projectId: string): Promise<string | null> => {
  try {
    const credentials = await getOAuthCredentials(userId, projectId);
    
    if (!credentials) {
      return null;
    }
    
    // Verificar si el token ha expirado
    if (credentials.expiresAt && Date.now() > credentials.expiresAt) {
      // TODO: Implementar refresh token logic
      console.warn('Access token expired, refresh logic not implemented yet');
      return null;
    }
    
    return credentials.accessToken;
  } catch (err) {
    console.error('[getValidAccessToken] Error:', err);
    return null;
  }
}; 