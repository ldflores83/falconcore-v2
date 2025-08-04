"use strict";
// functions/src/oauth/getOAuthCredentials.ts
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
exports.getValidAccessToken = exports.getOAuthCredentials = void 0;
const googleapis_1 = require("googleapis");
const admin = __importStar(require("firebase-admin"));
const config_1 = require("../config");
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
const getOAuthCredentials = async (userId = 'onboardingaudit_user') => {
    try {
        const db = getFirestore();
        const doc = await db.collection('oauth_credentials').doc(userId).get();
        if (!doc.exists) {
            console.log('❌ No se encontraron credenciales OAuth para:', userId);
            return null;
        }
        const data = doc.data();
        if (!data?.accessToken) {
            console.log('❌ Credenciales OAuth incompletas para:', userId);
            return null;
        }
        console.log('✅ Credenciales OAuth obtenidas para:', userId);
        return data;
    }
    catch (error) {
        console.error('❌ Error obteniendo credenciales OAuth:', error);
        return null;
    }
};
exports.getOAuthCredentials = getOAuthCredentials;
const getValidAccessToken = async (userId = 'onboardingaudit_user') => {
    try {
        const credentials = await (0, exports.getOAuthCredentials)(userId);
        if (!credentials) {
            return null;
        }
        // Verificar si el token ha expirado
        if (credentials.expiryDate && Date.now() > credentials.expiryDate) {
            console.log('⚠️ Token expirado, intentando refresh...');
            // Intentar refresh del token
            const oauthConfig = await (0, config_1.getOAuthConfig)();
            const oauth2Client = new googleapis_1.google.auth.OAuth2(oauthConfig.clientId, oauthConfig.clientSecret, oauthConfig.redirectUri);
            oauth2Client.setCredentials({
                access_token: credentials.accessToken,
                refresh_token: credentials.refreshToken,
                expiry_date: credentials.expiryDate
            });
            try {
                const { credentials: newCredentials } = await oauth2Client.refreshAccessToken();
                if (newCredentials.access_token) {
                    // Actualizar tokens en Firestore
                    const db = getFirestore();
                    await db.collection('oauth_credentials').doc(userId).update({
                        accessToken: newCredentials.access_token,
                        expiryDate: newCredentials.expiry_date,
                        updatedAt: new Date()
                    });
                    console.log('✅ Token refrescado exitosamente');
                    return newCredentials.access_token;
                }
            }
            catch (refreshError) {
                console.error('❌ Error refrescando token:', refreshError);
                return null;
            }
        }
        return credentials.accessToken;
    }
    catch (error) {
        console.error('❌ Error obteniendo access token válido:', error);
        return null;
    }
};
exports.getValidAccessToken = getValidAccessToken;
