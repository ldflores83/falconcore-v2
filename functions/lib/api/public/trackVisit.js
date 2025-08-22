"use strict";
// functions/src/api/public/trackVisit.ts
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
exports.trackVisit = void 0;
const admin = __importStar(require("firebase-admin"));
const configService_1 = require("../../services/configService");
// Función para obtener Firestore de forma lazy
const getFirestore = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: 'falconcore-v2'
        });
    }
    return admin.firestore();
};
const trackVisit = async (req, res) => {
    try {
        const { projectId, page, referrer, userAgent, screenResolution, timeOnPage, scrollDepth, interactions, sessionId, userId } = req.body;
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Missing projectId parameter"
            });
        }
        // Validar que el proyecto esté configurado
        if (!configService_1.ConfigService.isProductConfigured(projectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project configuration"
            });
        }
        // Validar que las características necesarias estén habilitadas
        if (!configService_1.ConfigService.isFeatureEnabled(projectId, 'analytics')) {
            return res.status(400).json({
                success: false,
                message: "Analytics is not enabled for this project"
            });
        }
        const db = getFirestore();
        const timestamp = new Date();
        const dateKey = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
        // Obtener nombres de colecciones específicos del proyecto
        const analyticsVisitsCollection = configService_1.ConfigService.getCollectionName(projectId, 'analytics_visits');
        const analyticsStatsCollection = configService_1.ConfigService.getCollectionName(projectId, 'analytics_stats');
        // Guardar visita individual
        const visitData = {
            projectId,
            page: page || 'unknown',
            referrer: referrer || 'direct',
            userAgent: userAgent || 'unknown',
            screenResolution: screenResolution || 'unknown',
            timeOnPage: timeOnPage || 0,
            scrollDepth: scrollDepth || 0,
            interactions: interactions || [],
            sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: userId || 'anonymous',
            timestamp,
            dateKey,
            hour: timestamp.getHours(),
            dayOfWeek: timestamp.getDay(),
            month: timestamp.getMonth() + 1
        };
        await db.collection(analyticsVisitsCollection).add(visitData);
        // Actualizar estadísticas agregadas por día
        const statsRef = db.collection(analyticsStatsCollection).doc(`${projectId}_${dateKey}`);
        await db.runTransaction(async (transaction) => {
            const statsDoc = await transaction.get(statsRef);
            if (!statsDoc.exists) {
                // Crear nuevo documento de estadísticas
                transaction.set(statsRef, {
                    projectId,
                    dateKey,
                    totalVisits: 1,
                    uniqueVisitors: 1,
                    sessions: 1,
                    pageViews: {
                        [page || 'unknown']: 1
                    },
                    referrers: {
                        [referrer || 'direct']: 1
                    },
                    devices: {
                        [getDeviceType(userAgent || '')]: 1
                    },
                    avgTimeOnPage: timeOnPage || 0,
                    totalTimeOnPage: timeOnPage || 0,
                    avgScrollDepth: scrollDepth || 0,
                    totalScrollDepth: scrollDepth || 0,
                    interactions: interactions?.length || 0,
                    lastUpdated: timestamp
                });
            }
            else {
                // Actualizar estadísticas existentes
                const currentStats = statsDoc.data();
                const newStats = {
                    ...currentStats,
                    totalVisits: currentStats.totalVisits + 1,
                    pageViews: {
                        ...currentStats.pageViews,
                        [page || 'unknown']: (currentStats.pageViews?.[page || 'unknown'] || 0) + 1
                    },
                    referrers: {
                        ...currentStats.referrers,
                        [referrer || 'direct']: (currentStats.referrers?.[referrer || 'direct'] || 0) + 1
                    },
                    devices: {
                        ...currentStats.devices,
                        [getDeviceType(userAgent || '')]: (currentStats.devices?.[getDeviceType(userAgent || '')] || 0) + 1
                    },
                    avgTimeOnPage: ((currentStats.avgTimeOnPage * currentStats.totalVisits) + (timeOnPage || 0)) / (currentStats.totalVisits + 1),
                    totalTimeOnPage: (currentStats.totalTimeOnPage || 0) + (timeOnPage || 0),
                    avgScrollDepth: ((currentStats.avgScrollDepth * currentStats.totalVisits) + (scrollDepth || 0)) / (currentStats.totalVisits + 1),
                    totalScrollDepth: (currentStats.totalScrollDepth || 0) + (scrollDepth || 0),
                    interactions: (currentStats.interactions || 0) + (interactions?.length || 0),
                    lastUpdated: timestamp
                };
                // Actualizar visitantes únicos si es necesario
                if (userId && userId !== 'anonymous') {
                    // Para simplificar, incrementamos el contador de visitantes únicos
                    // En una implementación real, necesitarías mantener un Set de userIds
                    newStats.uniqueVisitors = (currentStats.uniqueVisitors || 1) + 1;
                }
                else {
                    newStats.uniqueVisitors = currentStats.uniqueVisitors || 1;
                }
                transaction.update(statsRef, newStats);
            }
        });
        console.log('✅ Visit tracked successfully:', {
            projectId,
            page,
            timestamp: timestamp.toISOString(),
            collections: {
                visits: analyticsVisitsCollection,
                stats: analyticsStatsCollection
            }
        });
        return res.status(200).json({
            success: true,
            message: "Visit tracked successfully",
            sessionId: visitData.sessionId
        });
    }
    catch (error) {
        console.error('❌ Error tracking visit:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to track visit",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.trackVisit = trackVisit;
// Función auxiliar para determinar el tipo de dispositivo
const getDeviceType = (userAgent) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        return 'mobile';
    }
    else if (ua.includes('tablet') || ua.includes('ipad')) {
        return 'tablet';
    }
    else {
        return 'desktop';
    }
};
