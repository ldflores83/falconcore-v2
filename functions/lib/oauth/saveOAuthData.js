"use strict";
// functions/src/oauth/saveOAuthData.ts
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
exports.saveOAuthData = void 0;
const admin = __importStar(require("firebase-admin"));
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
const saveOAuthData = async (params) => {
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
    }
    catch (error) {
        console.error('❌ Error saving OAuth data:', error);
        throw error;
    }
};
exports.saveOAuthData = saveOAuthData;
