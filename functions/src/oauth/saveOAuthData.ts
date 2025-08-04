// functions/src/oauth/saveOAuthData.ts

import * as admin from 'firebase-admin';

// Función para obtener Firestore de forma lazy
const getFirestore = () => {
  if (!admin.apps.length) {
    // Inicializar Firebase sin credenciales de servicio automáticas
    // para evitar conflictos con OAuth
    admin.initializeApp({
      projectId: 'falconcore-v2',
      // No especificar credential para usar la autenticación por defecto
      // que funciona mejor con OAuth
    });
  }
  return admin.firestore();
};

export const saveOAuthData = async (params: {
  userId: string;
  projectId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  folderId: string;
  email: string;
}) => {
  try {
    const db = getFirestore();
    
    // Guardar datos OAuth en Firestore
    await db.collection('oauth_credentials').doc(params.userId).set({
      accessToken: params.accessToken,
      refreshToken: params.refreshToken || null,
      expiryDate: params.expiresAt || null,
      projectId: params.projectId,
      folderId: params.folderId,
      email: params.email,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ OAuth data saved successfully:', {
      userId: params.userId,
      projectId: params.projectId,
      email: params.email,
      folderId: params.folderId
    });

    return {
      success: true,
      message: 'OAuth data saved successfully'
    };

  } catch (error) {
    console.error('❌ Error saving OAuth data:', error);
    throw error;
  }
};
