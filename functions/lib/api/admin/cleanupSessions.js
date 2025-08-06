"use strict";
// functions/src/api/admin/cleanupSessions.ts
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
exports.cleanupSessions = void 0;
const admin = __importStar(require("firebase-admin"));
// Función para obtener Firestore de forma lazy
const getFirestore = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: 'falconcore-v2'
        });
    }
    return admin.firestore();
};
const cleanupSessions = async (req, res) => {
    try {
        const { projectId, userId } = req.body;
        if (!projectId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters: projectId and userId"
            });
        }
        // Verificar que el userId corresponde al email autorizado
        if (!userId.includes('luisdaniel883@gmail.com')) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only authorized administrators can cleanup sessions."
            });
        }
        const db = getFirestore();
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        // Buscar sesiones expiradas
        const sessionsRef = db.collection('admin_sessions');
        const expiredSessions = await sessionsRef
            .where('expiresAt', '<', admin.firestore.Timestamp.fromMillis(now))
            .get();
        const deletedCount = expiredSessions.size;
        // Eliminar sesiones expiradas
        const deletePromises = expiredSessions.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        console.log('✅ Cleanup sessions successful:', {
            projectId,
            userId,
            deletedCount
        });
        return res.status(200).json({
            success: true,
            message: "Sessions cleanup completed",
            deletedCount
        });
    }
    catch (error) {
        console.error('❌ Error in sessions cleanup:', error);
        return res.status(500).json({
            success: false,
            message: "Sessions cleanup failed",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.cleanupSessions = cleanupSessions;
