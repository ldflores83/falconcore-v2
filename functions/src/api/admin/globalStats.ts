import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { ConfigService } from '../../services/configService';
import { logger } from '../../utils/logger';

export const getGlobalStats = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    logger.startOperation('get_global_stats', { 
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    });

    const db = admin.firestore();
    const configuredProducts = ConfigService.getConfiguredProducts();
    
    let totalVisits = 0;
    let totalSubmissions = 0;
    let totalWaitlist = 0;
    const recentActivity: Array<{
      id: string;
      description: string;
      productName: string;
      timestamp: string;
      type: string;
    }> = [];
    
    // Obtener estadísticas de cada producto configurado
    for (const projectId of configuredProducts) {
      try {
        // Obtener submissions
        if (ConfigService.isFeatureEnabled(projectId, 'formSubmission')) {
          const submissionsCollection = ConfigService.getCollectionName(projectId, 'submissions');
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
        if (ConfigService.isFeatureEnabled(projectId, 'waitlist')) {
          const waitlistCollection = ConfigService.getCollectionName(projectId, 'waitlist');
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
        if (ConfigService.isFeatureEnabled(projectId, 'analytics')) {
          try {
            const analyticsStatsCollection = ConfigService.getCollectionName(projectId, 'analytics_stats');
            const analyticsStatsSnapshot = await db.collection(analyticsStatsCollection).get();
            
            analyticsStatsSnapshot.docs.forEach(doc => {
              const data = doc.data();
              if (data.totalVisits && typeof data.totalVisits === 'number') {
                totalVisits += data.totalVisits;
              }
            });
          } catch (analyticsError) {
            // Si no hay datos de analytics, continuar sin error
            logger.warn(`No analytics data for project ${projectId}`, { projectId });
          }
        }
        
      } catch (productError) {
        logger.warn(`Error getting stats for project ${projectId}`, { projectId }, productError instanceof Error ? productError : new Error(String(productError)));
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
    
    logger.info('Global stats retrieved successfully');
    
    res.json(globalStats);
    
  } catch (error) {
    logger.error('Error getting global stats', {}, error instanceof Error ? error : new Error(String(error)));
    
    res.status(500).json({
      error: 'Error retrieving global statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    const duration = Date.now() - startTime;
    logger.endOperation('get_global_stats', { duration });
  }
};
