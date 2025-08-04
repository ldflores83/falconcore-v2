"use strict";
// functions/src/oauth/setupManualAuth.ts
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
exports.testManualAuth = exports.setupManualAuthWithCode = exports.setupManualAuth = void 0;
const googleapis_1 = require("googleapis");
const admin = __importStar(require("firebase-admin"));
const config_1 = require("../config");
// Función para obtener Firestore de forma lazy
const getFirestore = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: 'falconcore-v2'
        });
    }
    return admin.firestore();
};
const setupManualAuth = async () => {
    try {
        console.log('🔗 Iniciando setup manual de OAuth...');
        // Configurar OAuth2
        const oauthConfig = await (0, config_1.getOAuthConfig)();
        const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
        // Generar URL de autorización
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/documents',
                'https://www.googleapis.com/auth/presentations'
            ],
            prompt: 'consent'
        });
        console.log('✅ URL de autorización generada:', authUrl);
        console.log('📋 Instrucciones:');
        console.log('1. Copia y pega esta URL en tu navegador');
        console.log('2. Autoriza la aplicación');
        console.log('3. Copia el código de autorización');
        console.log('4. Ejecuta setupManualAuthWithCode con el código');
        return {
            success: true,
            authUrl,
            message: 'URL de autorización generada. Sigue las instrucciones en los logs.'
        };
    }
    catch (error) {
        console.error('❌ Error en setupManualAuth:', error);
        return {
            success: false,
            message: 'Error generando URL de autorización',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};
exports.setupManualAuth = setupManualAuth;
const setupManualAuthWithCode = async (code) => {
    try {
        console.log('🔄 Intercambiando código por tokens...');
        // Configurar OAuth2
        const oauthConfig = await (0, config_1.getOAuthConfig)();
        const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
        // Intercambiar código por tokens
        const { tokens } = await oauth2Client.getToken(code);
        if (!tokens.access_token) {
            throw new Error('No se obtuvo access_token');
        }
        // Guardar tokens en Firestore
        const db = getFirestore();
        const userId = 'onboardingaudit_user'; // Usuario fijo para onboardingaudit
        await db.collection('oauth_credentials').doc(userId).set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || null,
            expiryDate: tokens.expiry_date || null,
            scope: tokens.scope,
            tokenType: tokens.token_type,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('✅ Tokens guardados en Firestore:', {
            userId,
            hasAccessToken: !!tokens.access_token,
            hasRefreshToken: !!tokens.refresh_token,
            expiryDate: tokens.expiry_date
        });
        return {
            success: true,
            message: 'Tokens guardados exitosamente en Firestore',
            userId
        };
    }
    catch (error) {
        console.error('❌ Error en setupManualAuthWithCode:', error);
        return {
            success: false,
            message: 'Error intercambiando código por tokens',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};
exports.setupManualAuthWithCode = setupManualAuthWithCode;
const testManualAuth = async () => {
    try {
        console.log('🧪 Probando credenciales OAuth...');
        const db = getFirestore();
        const userId = 'onboardingaudit_user';
        // Obtener credenciales de Firestore
        const doc = await db.collection('oauth_credentials').doc(userId).get();
        if (!doc.exists) {
            return {
                success: false,
                message: 'No se encontraron credenciales OAuth. Ejecuta setupManualAuth primero.'
            };
        }
        const credentials = doc.data();
        if (!credentials?.accessToken) {
            return {
                success: false,
                message: 'Credenciales incompletas. Ejecuta setupManualAuthWithCode.'
            };
        }
        // Probar conexión con Google Drive
        const oauthConfig = await (0, config_1.getOAuthConfig)();
        const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
        oauth2Client.setCredentials({
            access_token: credentials.accessToken,
            refresh_token: credentials.refreshToken,
            expiry_date: credentials.expiryDate
        });
        const drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
        // Probar acceso a Drive
        const about = await drive.about.get({
            fields: 'user,storageQuota'
        });
        console.log('✅ Conexión exitosa con Google Drive:', {
            user: about.data.user?.displayName,
            email: about.data.user?.emailAddress,
            quota: about.data.storageQuota
        });
        return {
            success: true,
            message: 'Conexión exitosa con Google Drive',
            user: about.data.user?.displayName,
            email: about.data.user?.emailAddress
        };
    }
    catch (error) {
        console.error('❌ Error en testManualAuth:', error);
        return {
            success: false,
            message: 'Error probando credenciales OAuth',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};
exports.testManualAuth = testManualAuth;
