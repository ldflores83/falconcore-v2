// /src/storage/utils/saveTokens.ts
import { db } from '../../firebase';

export async function saveTokensAndFolder(
  email: string,
  projectId: string,
  tokens: { access_token: string; refresh_token?: string },
  folderId: string
): Promise<void> {
  const ref = db.collection('users').doc(email).collection('projects').doc(projectId);
  await ref.set({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || null,
    folderId,
    lastLogin: new Date(),
  }, { merge: true });

  console.log(`[Firestore Debug] Guardado tokens y folder para ${email}/${projectId}`);
}
