// functions/src/oauth/saveOAuthData.ts

import * as admin from 'firebase-admin';
import { encrypt } from '../utils/encryption';

export interface OAuthData {
  clientId: string;
  projectId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  folderId?: string;
  email: string;
}

export const saveOAuthData = async (data: OAuthData): Promise<void> => {
  try {
    // Cifrar tokens antes de guardar
    const encryptedData = {
      ...data,
      accessToken: await encrypt(data.accessToken),
      refreshToken: data.refreshToken ? await encrypt(data.refreshToken) : undefined,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    await admin.firestore()
      .collection('oauth_credentials')
      .doc(data.clientId)
      .set(encryptedData);

  } catch (error) {
    console.error('❌ OAuth: Error saving OAuth data:', error);
    throw new Error(`Failed to save OAuth data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
