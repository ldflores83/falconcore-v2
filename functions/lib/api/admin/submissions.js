"use strict";
// functions/src/api/admin/submissions.ts
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
exports.getSubmissions = void 0;
const getOAuthCredentials_1 = require("../../oauth/getOAuthCredentials");
const hash_1 = require("../../utils/hash");
const admin = __importStar(require("firebase-admin"));
const getFirestore = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: 'falconcore-v2',
        });
    }
    return admin.firestore();
};
const getSubmissions = async (req, res) => {
    try {
        const { projectId, clientId } = req.body;
        if (!projectId || !clientId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: projectId and clientId"
            });
        }
        // Verificar que el clientId corresponde al email autorizado
        const expectedClientId = (0, hash_1.generateClientId)('luisdaniel883@gmail.com', projectId);
        if (clientId !== expectedClientId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only authorized administrators can access submissions."
            });
        }
        // Verificar credenciales OAuth
        const credentials = await (0, getOAuthCredentials_1.getOAuthCredentials)(clientId);
        if (!credentials) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated. Please login first."
            });
        }
        // Obtener submissions desde Firestore (fuente de verdad para el dashboard)
        const db = getFirestore();
        console.log('📁 Loading submissions from Firestore...');
        // Obtener todas las submissions de Firestore
        const snapshot = await db.collection('onboardingaudit_submissions')
            .orderBy('createdAt', 'desc')
            .get();
        const submissions = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                email: data.email || 'Unknown',
                productName: data.productName || 'Unknown',
                productUrl: data.productUrl || '',
                targetUser: data.targetUser || 'Unknown',
                mainGoal: data.mainGoal || 'Unknown',
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
                status: data.status || 'pending',
                folderId: data.driveFolderId || null
            };
        });
        console.log('📁 Submissions loaded from Firestore:', {
            projectId,
            clientId,
            submissionsCount: submissions.length,
            submissions: submissions.map(s => ({ id: s.id, email: s.email, status: s.status }))
        });
        // También obtener submissions pendientes desde Firestore para el contador
        const pendingSnapshot = await db.collection('onboardingaudit_submissions')
            .where('status', '==', 'pending')
            .get();
        const pendingCount = pendingSnapshot.docs.length;
        console.log('✅ Admin submissions loaded with pending count:', {
            projectId,
            clientId,
            submissionsCount: submissions.length,
            pendingCount
        });
        return res.status(200).json({
            success: true,
            submissions,
            pendingCount
        });
    }
    catch (error) {
        console.error('❌ Error loading admin submissions:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to load submissions",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getSubmissions = getSubmissions;
