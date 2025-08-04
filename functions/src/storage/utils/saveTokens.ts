// /src/storage/utils/saveTokens.ts
// import { db } from '../../firebase';

export const saveTokens = async (params: {
  userId: string;
  projectId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  folderId: string;
}) => {
  // Temporalmente comentado para debug
  console.log('saveTokens called with:', params);
};
