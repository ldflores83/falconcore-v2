// functions/src/debug/serviceAccountDebug.ts

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as admin from 'firebase-admin';

export const debugServiceAccount = async () => {
  console.log('🔧 DEBUG: Service Account Configuration');
  
  try {
    // 1. Verificar la service account actual
    console.log('🔧 1. Checking current service account...');
    
    // Verificar si Firebase está inicializado
    try {
      const app = admin.app();
      console.log('✅ Firebase app initialized');
      console.log('🔧 Project ID:', app.options.projectId);
      console.log('🔧 Service account type:', app.options.credential ? 'Custom credential' : 'Default credential');
    } catch (error) {
      console.log('⚠️ Firebase app not initialized yet, this is normal');
      console.log('🔧 Expected project ID: falconcore-v2');
      console.log('🔧 Expected service account: 1038906476883-compute@developer.gserviceaccount.com');
    }

    // 2. Verificar Secret Manager access
    console.log('🔧 2. Testing Secret Manager access...');
    
    const client = new SecretManagerServiceClient();
    const projectId = 'falconcore-v2';
    
    try {
      // Listar todos los secrets disponibles
      console.log('🔧 Listing available secrets...');
      const [secrets] = await client.listSecrets({
        parent: `projects/${projectId}`,
      });
      
      console.log('✅ Available secrets:');
      secrets.forEach(secret => {
        console.log(`  - ${secret.name}`);
      });
      
      // Intentar acceder a un secret específico
      console.log('🔧 Testing access to GOOGLE_CLIENT_ID...');
      const secretName = `projects/${projectId}/secrets/GOOGLE_CLIENT_ID/versions/latest`;
      
      try {
        const [secretVersion] = await client.accessSecretVersion({
          name: secretName,
        });
        
        console.log('✅ Successfully accessed GOOGLE_CLIENT_ID');
        console.log('🔧 Secret value length:', secretVersion.payload?.data?.toString().length || 0);
      } catch (secretError) {
        console.error('❌ Error accessing GOOGLE_CLIENT_ID:', secretError);
        console.error('❌ Error details:', {
          name: (secretError as any).name,
          message: (secretError as any).message,
          code: (secretError as any).code,
          status: (secretError as any).status
        });
      }
      
    } catch (listError) {
      console.error('❌ Error listing secrets:', listError);
      console.error('❌ Error details:', {
        name: (listError as any).name,
        message: (listError as any).message,
        code: (listError as any).code,
        status: (listError as any).status
      });
    }

    // 3. Verificar IAM roles
    console.log('🔧 3. Checking IAM roles...');
    console.log('🔧 Note: IAM roles can only be verified in Google Cloud Console');
    console.log('🔧 Expected roles for service account:');
    console.log('  - roles/secretmanager.secretAccessor');
    console.log('  - roles/editor');
    console.log('  - roles/storage.objectAdmin');

    // 4. Verificar variables de entorno
    console.log('🔧 4. Checking environment variables...');
    console.log('🔧 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    console.log('🔧 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
    console.log('🔧 GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI ? 'Set' : 'Not set');
    console.log('🔧 FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'falconcore-v2');

    // 5. Verificar Firebase config
    console.log('🔧 5. Checking Firebase configuration...');
    console.log('🔧 Project ID:', admin.app().options.projectId);
    console.log('🔧 Service account:', admin.app().options.credential ? 'Custom credential' : 'Default credential');

  } catch (error) {
    console.error('❌ General error in service account debug:', error);
  }
};

// Función para probar acceso a Secret Manager específicamente
export const testSecretManagerAccess = async () => {
  console.log('🔧 DEBUG: Testing Secret Manager Access');
  
  const client = new SecretManagerServiceClient();
  const projectId = 'falconcore-v2';
  
  const secretsToTest = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GOOGLE_REDIRECT_URI'
  ];
  
  for (const secretName of secretsToTest) {
    console.log(`🔧 Testing access to ${secretName}...`);
    
    try {
      const secretPath = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      const [secretVersion] = await client.accessSecretVersion({
        name: secretPath,
      });
      
      console.log(`✅ Successfully accessed ${secretName}`);
      console.log(`🔧 Value length: ${secretVersion.payload?.data?.toString().length || 0}`);
      
    } catch (error) {
      console.error(`❌ Failed to access ${secretName}:`, error);
      console.error('❌ Error details:', {
        name: (error as any).name,
        message: (error as any).message,
        code: (error as any).code,
        status: (error as any).status
      });
    }
  }
}; 