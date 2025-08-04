// functions/src/scripts/checkOAuthCredentials.ts

import { getOAuthCredentials } from '../oauth/getOAuthCredentials';

const checkAdminCredentials = async () => {
  console.log('🔍 Checking admin OAuth credentials...');
  
  const adminEmail = 'luisdaniel883@gmail.com';
  const adminUserId = `${adminEmail}_onboardingaudit`;
  
  console.log('🔍 Looking for credentials with userId:', adminUserId);
  
  try {
    const credentials = await getOAuthCredentials(adminUserId);
    
    if (credentials) {
      console.log('✅ Admin credentials found:', {
        hasAccessToken: !!credentials.accessToken,
        hasRefreshToken: !!credentials.refreshToken,
        accessTokenLength: credentials.accessToken?.length || 0,
        expiryDate: credentials.expiryDate ? new Date(credentials.expiryDate).toISOString() : 'No expiry',
        isExpired: credentials.expiryDate ? Date.now() > credentials.expiryDate : false,
        createdAt: credentials.createdAt,
        updatedAt: credentials.updatedAt
      });
    } else {
      console.log('❌ No admin credentials found for:', adminUserId);
      console.log('💡 You need to setup OAuth for the admin user first.');
    }
  } catch (error) {
    console.error('❌ Error checking credentials:', error);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  checkAdminCredentials()
    .then(() => {
      console.log('✅ Check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Check failed:', error);
      process.exit(1);
    });
}

export { checkAdminCredentials }; 