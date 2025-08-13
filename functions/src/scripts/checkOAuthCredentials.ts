// functions/src/scripts/checkOAuthCredentials.ts

import { getOAuthCredentials } from '../oauth/getOAuthCredentials';

export const checkOAuthCredentials = async (clientId: string) => {
  try {
    const credentials = await getOAuthCredentials(clientId);

    if (!credentials) {
      console.log('❌ No OAuth credentials found for:', clientId);
      return {
        success: false,
        message: 'No OAuth credentials found'
      };
    }

    const credentialInfo = {
      clientId: credentials.clientId,
      projectId: credentials.projectId,
      email: credentials.email,
      hasAccessToken: !!credentials.accessToken,
      hasRefreshToken: !!credentials.refreshToken,
      expiresAt: credentials.expiresAt ? new Date(credentials.expiresAt).toISOString() : 'No expiry',
      isExpired: credentials.expiresAt ? Date.now() > credentials.expiresAt : false,
      folderId: credentials.folderId
    };

    console.log('✅ OAuth credentials found:', credentialInfo);

    return {
      success: true,
      message: 'OAuth credentials found',
      data: credentialInfo
    };

  } catch (error) {
    console.error('❌ Error checking OAuth credentials:', error);
    return {
      success: false,
      message: 'Error checking OAuth credentials',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  // This part of the script is no longer relevant for the new checkOAuthCredentials function
  // as it expects a clientId directly.
  // If you need to check a specific admin user, you would call checkOAuthCredentials with their clientId.
  // For example:
  // checkOAuthCredentials('generated_client_id_hash')
  //   .then(result => {
  //     console.log('✅ Check completed:', result);
  //     process.exit(0);
  //   })
  //   .catch(error => {
  //     console.error('❌ Check failed:', error);
  //     process.exit(1);
  //   });
  console.log('This script is now primarily for checking specific user credentials.');
  console.log('To check admin credentials, you would call checkOAuthCredentials with their clientId.');
  process.exit(0);
} 