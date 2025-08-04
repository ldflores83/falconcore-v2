// functions/src/api/public/trackVisit.ts

import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

// Función para obtener Firestore de forma lazy
const getFirestore = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'falconcore-v2'
    });
  }
  return admin.firestore();
};

export const trackVisit = async (req: Request, res: Response) => {
  try {
    const { 
      projectId, 
      page, 
      referrer, 
      userAgent, 
      screenResolution,
      timeOnPage,
      scrollDepth,
      interactions,
      sessionId,
      userId 
    } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing projectId parameter"
      });
    }

    const db = getFirestore();
    const timestamp = new Date();
    const dateKey = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD

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

    await db.collection('analytics_visits').add(visitData);

    // Actualizar estadísticas agregadas por día
    const statsRef = db.collection('analytics_stats').doc(`${projectId}_${dateKey}`);
    
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
      } else {
        // Actualizar estadísticas existentes
        const currentStats = statsDoc.data()!;
        const newStats: any = {
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
          const uniqueVisitors = currentStats.uniqueVisitors || new Set();
          uniqueVisitors.add(userId);
          newStats.uniqueVisitors = uniqueVisitors.size;
        } else {
          newStats.uniqueVisitors = currentStats.uniqueVisitors || 1;
        }

        transaction.update(statsRef, newStats);
      }
    });

    console.log('✅ Visit tracked successfully:', {
      projectId,
      page,
      timestamp: timestamp.toISOString()
    });

    return res.status(200).json({
      success: true,
      message: "Visit tracked successfully",
      sessionId: visitData.sessionId
    });

  } catch (error) {
    console.error('❌ Error tracking visit:', error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to track visit",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Función auxiliar para determinar el tipo de dispositivo
const getDeviceType = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}; 