// functions/src/api/admin/analytics.ts

import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { ConfigService } from '../../services/configService';

const getFirestore = () => admin.firestore();

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing projectId parameter"
      });
    }

    // Validar que el producto esté configurado
    if (!ConfigService.isProductConfigured(projectId)) {
      return res.status(400).json({
        success: false,
        message: `Product ${projectId} is not configured`
      });
    }

    // Validar que analytics esté habilitado
    if (!ConfigService.isFeatureEnabled(projectId, 'analytics')) {
      return res.status(400).json({
        success: false,
        message: `Analytics feature is not enabled for ${projectId}`
      });
    }

    const db = getFirestore();
    const submissionsCollection = ConfigService.getCollectionName(projectId, 'submissions');
    const waitlistCollection = ConfigService.getCollectionName(projectId, 'waitlist');
    const analyticsVisitsCollection = ConfigService.getCollectionName(projectId, 'analytics_visits');

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
          let timestamp: Date;
          
          if (data.createdAt.toDate) {
            timestamp = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            timestamp = data.createdAt;
          } else if (typeof data.createdAt === 'string') {
            timestamp = new Date(data.createdAt);
          } else {
            return;
          }
          
          if (timestamp > new Date(lastActivity)) {
            lastActivity = timestamp.toISOString();
          }
        }
      });
    } catch (error) {
      console.warn(`Error getting submissions for ${projectId}:`, error);
    }

    try {
      // Obtener waitlist
      const waitlistSnapshot = await db.collection(waitlistCollection).limit(1000).get();
      totalWaitlist = waitlistSnapshot.size;
    } catch (error) {
      console.warn(`Error getting waitlist for ${projectId}:`, error);
    }

    try {
      // Obtener analytics/visitas desde analytics_stats (estadísticas agregadas)
      const analyticsStatsCollection = ConfigService.getCollectionName(projectId, 'analytics_stats');
      const analyticsStatsSnapshot = await db.collection(analyticsStatsCollection).limit(1000).get();
      
      analyticsStatsSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Sumar totalVisits de las estadísticas agregadas
        if (data.totalVisits && typeof data.totalVisits === 'number') {
          totalVisits += data.totalVisits;
        }
        
        // Encontrar la actividad más reciente
        if (data.lastUpdated) {
          let timestamp: Date;
          
          if (data.lastUpdated.toDate) {
            timestamp = data.lastUpdated.toDate();
          } else if (data.lastUpdated instanceof Date) {
            timestamp = data.lastUpdated;
          } else if (typeof data.lastUpdated === 'string') {
            timestamp = new Date(data.lastUpdated);
          } else {
            return;
          }
          
          if (timestamp > new Date(lastActivity)) {
            lastActivity = timestamp.toISOString();
          }
        }
      });
    } catch (error) {
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

  } catch (error) {
    console.error('❌ Error getting analytics:', error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to get analytics",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 

