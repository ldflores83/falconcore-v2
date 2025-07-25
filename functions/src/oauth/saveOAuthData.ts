import { db } from "../firebase"; // ✅ Firestore ya inicializado desde firebase.ts

export const saveOAuthData = async (params: {
  userId: string;
  projectId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  folderId: string;
}) => {
  try {
    await db
      .collection("oauthData")
      .doc(`${params.userId}_${params.projectId}`)
      .set({
        accessToken: params.accessToken,
        refreshToken: params.refreshToken,
        expiresAt: params.expiresAt,
        folderId: params.folderId,
        updatedAt: new Date(),
      });
  } catch (err) {
    console.error('[saveOAuthData] Firestore write error:', err);
    throw err;
  }
};
