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
exports.getOAuthCredentials = void 0;
const admin = __importStar(require("firebase-admin"));
const encryption_1 = require("../utils/encryption");
const getOAuthCredentials = async (clientId) => {
    try {
        const doc = await admin.firestore()
            .collection('oauth_credentials')
            .doc(clientId)
            .get();
        if (!doc.exists) {
            return null;
        }
        const data = doc.data();
        if (!data || !data.accessToken || !data.projectId || !data.email) {
            return null;
        }
        // Descifrar tokens después de leer
        const decryptedData = {
            ...data, // Ensure all original fields are carried over
            accessToken: await (0, encryption_1.decrypt)(data.accessToken),
            refreshToken: data.refreshToken ? await (0, encryption_1.decrypt)(data.refreshToken) : undefined
        }; // Cast to any to resolve linter errors temporarily
        // Verificar si el token ha expirado
        if (decryptedData.expiresAt && Date.now() > decryptedData.expiresAt) {
            // Intentar refresh del token
            const refreshedCredentials = await refreshOAuthToken(clientId, decryptedData);
            if (refreshedCredentials) {
                return refreshedCredentials;
            }
            return null;
        }
        return {
            clientId: decryptedData.clientId,
            projectId: decryptedData.projectId,
            accessToken: decryptedData.accessToken,
            refreshToken: decryptedData.refreshToken,
            expiresAt: decryptedData.expiresAt,
            folderId: decryptedData.folderId,
            email: decryptedData.email
        };
    }
    catch (error) {
        return null;
    }
};
exports.getOAuthCredentials = getOAuthCredentials;
const refreshOAuthToken = async (clientId, credentials) => {
    try {
        if (!credentials.refreshToken) {
            return null;
        }
        // Aquí implementarías la lógica de refresh del token
        // Por ahora, simplemente retornamos null para forzar re-autenticación
        return null;
    }
    catch (error) {
        return null;
    }
};
