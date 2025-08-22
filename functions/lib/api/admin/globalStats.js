"use strict";
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
exports.getGlobalStats = void 0;
const admin = __importStar(require("firebase-admin"));
const configService_1 = require("../../services/configService");
const logger_1 = require("../../utils/logger");
const getGlobalStats = async (req, res) => {
    const startTime = Date.now();
    try {
        logger_1.logger.startOperation('get_global_stats', {
            ip: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown'
        });
        const db = admin.firestore();
        const configuredProducts = configService_1.ConfigService.getConfiguredProducts();
        let totalVisits = 0;
        let totalSubmissions = 0;
        let totalWaitlist = 0;
        const recentActivity = [];
        // Obtener estadísticas de cada producto configurado
        for (const projectId of configuredProducts) {
            try {
                // Obtener submissions
                if (configService_1.ConfigService.isFeatureEnabled(projectId, 'formSubmission')) {
                    const submissionsCollection = configService_1.ConfigService.getCollectionName(projectId, 'submissions');
                    const submissionsSnapshot = await db.collection(submissionsCollection)
                        .where('projectId', '==', projectId)
                        .get();
                    totalSubmissions += submissionsSnapshot.size;
                    // Agregar submissions recientes a la actividad
                    submissionsSnapshot.docs.slice(0, 3).forEach(doc => {
                        const data = doc.data();
                        const email = data.report_email || data.email || 'Unknown';
                        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date();
                        recentActivity.push({
                            id: `${projectId}_submission_${doc.id}`,
                            description: `New submission from ${email}`,
                            productName: projectId,
                            timestamp: createdAt.toISOString(),
                            type: 'submission'
                        });
                    });
                }
                // Obtener waitlist
                if (configService_1.ConfigService.isFeatureEnabled(projectId, 'waitlist')) {
                    const waitlistCollection = configService_1.ConfigService.getCollectionName(projectId, 'waitlist');
                    const waitlistSnapshot = await db.collection(waitlistCollection)
                        .where('projectId', '==', projectId)
                        .get();
                    totalWaitlist += waitlistSnapshot.size;
                    // Agregar waitlist recientes a la actividad
                    waitlistSnapshot.docs.slice(0, 2).forEach(doc => {
                        const data = doc.data();
                        const email = data.email || 'Unknown';
                        const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp) || new Date();
                        recentActivity.push({
                            id: `${projectId}_waitlist_${doc.id}`,
                            description: `New waitlist entry from ${email}`,
                            productName: projectId,
                            timestamp: timestamp.toISOString(),
                            type: 'waitlist'
                        });
                    });
                }
                // Obtener visitas (analytics) desde analytics_stats
                if (configService_1.ConfigService.isFeatureEnabled(projectId, 'analytics')) {
                    try {
                        const analyticsStatsCollection = configService_1.ConfigService.getCollectionName(projectId, 'analytics_stats');
                        const analyticsStatsSnapshot = await db.collection(analyticsStatsCollection).get();
                        analyticsStatsSnapshot.docs.forEach(doc => {
                            const data = doc.data();
                            if (data.totalVisits && typeof data.totalVisits === 'number') {
                                totalVisits += data.totalVisits;
                            }
                        });
                    }
                    catch (analyticsError) {
                        // Si no hay datos de analytics, continuar sin error
                        logger_1.logger.warn(`No analytics data for project ${projectId}`, { projectId });
                    }
                }
            }
            catch (productError) {
                logger_1.logger.warn(`Error getting stats for project ${projectId}`, { projectId }, productError instanceof Error ? productError : new Error(String(productError)));
            }
        }
        // Ordenar actividad reciente por timestamp
        recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const globalStats = {
            totalProducts: configuredProducts.length,
            totalVisits,
            totalSubmissions,
            totalWaitlist,
            recentActivity: recentActivity.slice(0, 10), // Top 10 más recientes
            lastUpdated: new Date().toISOString()
        };
        logger_1.logger.info('Global stats retrieved successfully');
        res.json(globalStats);
    }
    catch (error) {
        logger_1.logger.error('Error getting global stats', {}, error instanceof Error ? error : new Error(String(error)));
        res.status(500).json({
            error: 'Error retrieving global statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
    finally {
        const duration = Date.now() - startTime;
        logger_1.logger.endOperation('get_global_stats', { duration });
    }
};
exports.getGlobalStats = getGlobalStats;
