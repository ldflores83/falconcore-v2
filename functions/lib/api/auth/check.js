"use strict";
// functions/src/api/auth/check.ts
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
exports.check = exports.createAdminSession = void 0;
const getOAuthCredentials_1 = require("../../oauth/getOAuthCredentials");
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const hash_1 = require("../../utils/hash");
const projectAdmins_1 = require("../../config/projectAdmins");
const configService_1 = require("../../services/configService");
const createAdminSession = async (email, projectId) => {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const clientId = (0, hash_1.generateClientId)(email, projectId);
    console.log('🔐 createAdminSession: Creating session for:', { email, projectId, clientId, sessionToken });
    const sessionData = {
        clientId,
        projectId,
        email,
        createdAt: admin.firestore.Timestamp.now(),
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + (24 * 60 * 60 * 1000)), // 24 horas
        userAgent: 'admin-session',
        ipAddress: 'admin-creation'
    };
    console.log('🔐 createAdminSession: Session data to save:', sessionData);
    const collectionName = configService_1.ConfigService.getCollectionName(projectId, 'admin_sessions');
    await admin.firestore().collection(collectionName).doc(sessionToken).set(sessionData);
    console.log('✅ createAdminSession: Session saved to Firestore successfully');
    return sessionToken;
};
exports.createAdminSession = createAdminSession;
const check = async (req, res) => {
    try {
        console.log('🔐 check: Request received:', {
            body: req.body,
            hasProjectId: !!req.body.projectId,
            hasClientId: !!req.body.clientId,
            hasSessionToken: !!req.body.sessionToken
        });
        const { projectId, clientId, sessionToken } = req.body;
        if (!projectId) {
            console.log('❌ check: Missing projectId');
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: projectId"
            });
        }
        // Validar que el proyecto esté configurado
        if (!configService_1.ConfigService.isProductConfigured(projectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project configuration"
            });
        }
        // Si hay sessionToken, verificar la sesión de administrador
        if (sessionToken) {
            console.log('🔐 check: Checking session with token:', sessionToken);
            const collectionName = configService_1.ConfigService.getCollectionName(projectId, 'admin_sessions');
            const sessionDoc = await admin.firestore().collection(collectionName).doc(sessionToken).get();
            if (sessionDoc.exists) {
                const sessionData = sessionDoc.data();
                console.log('🔐 check: Session found:', sessionData);
                const now = admin.firestore.Timestamp.now();
                // Verificar que la sesión no ha expirado
                if (sessionData?.expiresAt && sessionData.expiresAt.toMillis() > now.toMillis()) {
                    console.log('🔐 check: Session not expired, checking admin permissions');
                    // Verificar que el usuario es admin del proyecto
                    if ((0, projectAdmins_1.isProjectAdmin)(sessionData.email, sessionData.projectId) && sessionData.projectId === projectId) {
                        console.log('✅ check: Admin session verified successfully');
                        return res.status(200).json({
                            success: true,
                            message: "Admin session verified",
                            email: sessionData.email,
                            projectId: sessionData.projectId,
                            clientId: sessionData.clientId,
                            sessionToken
                        });
                    }
                    else {
                        console.log('❌ check: Admin permissions check failed:', {
                            email: sessionData.email,
                            projectId: sessionData.projectId,
                            isAdmin: (0, projectAdmins_1.isProjectAdmin)(sessionData.email, sessionData.projectId),
                            projectMatch: sessionData.projectId === projectId
                        });
                    }
                }
                else {
                    console.log('❌ check: Session expired, deleting');
                    // Sesión expirada, eliminarla
                    const collectionName = configService_1.ConfigService.getCollectionName(projectId, 'admin_sessions');
                    await admin.firestore().collection(collectionName).doc(sessionToken).delete();
                }
            }
            else {
                console.log('❌ check: Session not found in Firestore');
            }
        }
        else {
            console.log('🔐 check: No sessionToken provided');
        }
        // Si no hay sessionToken válido, verificar credenciales OAuth
        if (!clientId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: clientId"
            });
        }
        // Obtener credenciales OAuth
        const credentials = await (0, getOAuthCredentials_1.getOAuthCredentials)(clientId);
        if (!credentials) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated. Please login first."
            });
        }
        // Verificar que el token es válido
        if (!credentials.accessToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please login again."
            });
        }
        // Verificar que el usuario es admin del proyecto
        if (!(0, projectAdmins_1.isProjectAdmin)(credentials.email, credentials.projectId)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not authorized as an administrator for this project."
            });
        }
        return res.status(200).json({
            success: true,
            message: "Authentication verified",
            email: credentials.email,
            projectId: credentials.projectId
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authentication check failed",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.check = check;
