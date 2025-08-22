"use strict";
// functions/src/api/admin/analytics.ts
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
exports.getAnalytics = void 0;
const admin = __importStar(require("firebase-admin"));
const configService_1 = require("../../services/configService");
const getFirestore = () => admin.firestore();
const getAnalytics = async (req, res) => {
    try {
        const { projectId } = req.body;
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Missing projectId parameter"
            });
        }
        // Validar que el producto esté configurado
        if (!configService_1.ConfigService.isProductConfigured(projectId)) {
            return res.status(400).json({
                success: false,
                message: `Product ${projectId} is not configured`
            });
        }
        // Validar que analytics esté habilitado
        if (!configService_1.ConfigService.isFeatureEnabled(projectId, 'analytics')) {
            return res.status(400).json({
                success: false,
                message: `Analytics feature is not enabled for ${projectId}`
            });
        }
        const db = getFirestore();
        const submissionsCollection = configService_1.ConfigService.getCollectionName(projectId, 'submissions');
        const waitlistCollection = configService_1.ConfigService.getCollectionName(projectId, 'waitlist');
        const analyticsVisitsCollection = configService_1.ConfigService.getCollectionName(projectId, 'analytics_visits');
        // Consultas secuenciales para evitar timeouts
        let totalSubmissions = 0;
        let totalWaitlist = 0;
        let totalVisits = 0;
        let lastActivity = new Date().toISOString();
        try {
            // Obtener submissions
            const submissionsSnapshot = await db.collection(submissionsCollection).limit(1000).get();
            totalSubmissions = submissionsSnapshot.size;
            // Encontrar la submission más reciente
            submissionsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.createdAt) {
                    let timestamp;
                    if (data.createdAt.toDate) {
                        timestamp = data.createdAt.toDate();
                    }
                    else if (data.createdAt instanceof Date) {
                        timestamp = data.createdAt;
                    }
                    else if (typeof data.createdAt === 'string') {
                        timestamp = new Date(data.createdAt);
                    }
                    else {
                        return;
                    }
                    if (timestamp > new Date(lastActivity)) {
                        lastActivity = timestamp.toISOString();
                    }
                }
            });
        }
        catch (error) {
            console.warn(`Error getting submissions for ${projectId}:`, error);
        }
        try {
            // Obtener waitlist
            const waitlistSnapshot = await db.collection(waitlistCollection).limit(1000).get();
            totalWaitlist = waitlistSnapshot.size;
        }
        catch (error) {
            console.warn(`Error getting waitlist for ${projectId}:`, error);
        }
        try {
            // Obtener analytics/visitas desde analytics_stats (estadísticas agregadas)
            const analyticsStatsCollection = configService_1.ConfigService.getCollectionName(projectId, 'analytics_stats');
            const analyticsStatsSnapshot = await db.collection(analyticsStatsCollection).limit(1000).get();
            analyticsStatsSnapshot.forEach(doc => {
                const data = doc.data();
                // Sumar totalVisits de las estadísticas agregadas
                if (data.totalVisits && typeof data.totalVisits === 'number') {
                    totalVisits += data.totalVisits;
                }
                // Encontrar la actividad más reciente
                if (data.lastUpdated) {
                    let timestamp;
                    if (data.lastUpdated.toDate) {
                        timestamp = data.lastUpdated.toDate();
                    }
                    else if (data.lastUpdated instanceof Date) {
                        timestamp = data.lastUpdated;
                    }
                    else if (typeof data.lastUpdated === 'string') {
                        timestamp = new Date(data.lastUpdated);
                    }
                    else {
                        return;
                    }
                    if (timestamp > new Date(lastActivity)) {
                        lastActivity = timestamp.toISOString();
                    }
                }
            });
        }
        catch (error) {
            console.warn(`Error getting analytics stats for ${projectId}:`, error);
        }
        // Calcular tasa de conversión
        const conversionRate = totalVisits > 0 ? ((totalSubmissions + totalWaitlist) / totalVisits) * 100 : 0;
        return res.status(200).json({
            success: true,
            productId: projectId,
            totalVisits,
            totalSubmissions,
            totalWaitlist,
            conversionRate: Math.round(conversionRate * 100) / 100,
            lastActivity
        });
    }
    catch (error) {
        console.error('❌ Error getting analytics:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to get analytics",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAnalytics = getAnalytics;
