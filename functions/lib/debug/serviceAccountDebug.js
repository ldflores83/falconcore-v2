"use strict";
// functions/src/debug/serviceAccountDebug.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSecretManagerAccess = exports.debugServiceAccount = void 0;
const secret_manager_1 = require("@google-cloud/secret-manager");
const admin = __importStar(require("firebase-admin"));
const debugServiceAccount = async () => {
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
        }
        catch (error) {
            console.log('⚠️ Firebase app not initialized yet, this is normal');
            console.log('🔧 Expected project ID: falconcore-v2');
            console.log('🔧 Expected service account: 1038906476883-compute@developer.gserviceaccount.com');
        }
        // 2. Verificar Secret Manager access
        console.log('🔧 2. Testing Secret Manager access...');
        const client = new secret_manager_1.SecretManagerServiceClient();
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
            }
            catch (secretError) {
                console.error('❌ Error accessing GOOGLE_CLIENT_ID:', secretError);
                console.error('❌ Error details:', {
                    name: secretError.name,
                    message: secretError.message,
                    code: secretError.code,
                    status: secretError.status
                });
            }
        }
        catch (listError) {
            console.error('❌ Error listing secrets:', listError);
            console.error('❌ Error details:', {
                name: listError.name,
                message: listError.message,
                code: listError.code,
                status: listError.status
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
    }
    catch (error) {
        console.error('❌ General error in service account debug:', error);
    }
};
exports.debugServiceAccount = debugServiceAccount;
// Función para probar acceso a Secret Manager específicamente
const testSecretManagerAccess = async () => {
    console.log('🔧 DEBUG: Testing Secret Manager Access');
    const client = new secret_manager_1.SecretManagerServiceClient();
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
        }
        catch (error) {
            console.error(`❌ Failed to access ${secretName}:`, error);
            console.error('❌ Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                status: error.status
            });
        }
    }
};
exports.testSecretManagerAccess = testSecretManagerAccess;
