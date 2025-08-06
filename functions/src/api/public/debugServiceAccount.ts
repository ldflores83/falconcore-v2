// functions/src/api/public/debugServiceAccount.ts

import { debugServiceAccount, testSecretManagerAccess } from '../../debug/serviceAccountDebug';

export const debugServiceAccountHandler = async (req: any, res: any) => {
  console.log('🔧 DEBUG: Service Account Debug Endpoint Called');
  
  try {
    // Ejecutar debug completo
    await debugServiceAccount();
    
    // Ejecutar test específico de Secret Manager
    await testSecretManagerAccess();
    
    res.status(200).json({
      success: true,
      message: 'Service account debug completed. Check logs for details.',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in service account debug:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error during service account debug',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}; 