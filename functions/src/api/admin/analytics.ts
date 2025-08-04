// functions/src/api/admin/analytics.ts

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

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { projectId, period = '7d' } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing projectId parameter"
      });
    }

    // Verificar que el userId corresponde al email autorizado
    const { userId } = req.body;
    if (!userId || !userId.includes('luisdaniel883@gmail.com')) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only authorized administrators can access analytics."
      });
    }

    const db = getFirestore();
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    
    // Calcular fecha de inicio basada en el período
    let startDate: string;
    switch (period) {
      case '1d':
        startDate = endDate;
        break;
      case '7d':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = sevenDaysAgo.toISOString().split('T')[0];
        break;
      case '30d':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
        break;
      default:
        const defaultSevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = defaultSevenDaysAgo.toISOString().split('T')[0];
    }

    // Obtener estadísticas agregadas
    const statsQuery = db.collection('analytics_stats')
      .where('projectId', '==', projectId)
      .where('dateKey', '>=', startDate)
      .where('dateKey', '<=', endDate)
      .orderBy('dateKey', 'desc');

    const statsSnapshot = await statsQuery.get();
    const statsData = statsSnapshot.docs.map(doc => doc.data());

    // Obtener datos de formularios para calcular conversión
    const submissionsQuery = db.collection('form_submissions')
      .where('projectId', '==', projectId)
      .where('createdAt', '>=', new Date(startDate))
      .where('createdAt', '<=', new Date(endDate + 'T23:59:59'));

    const submissionsSnapshot = await submissionsQuery.get();
    const submissionsData = submissionsSnapshot.docs.map(doc => doc.data());

    // Calcular métricas agregadas
    const totalVisits = statsData.reduce((sum, stat) => sum + (stat.totalVisits || 0), 0);
    const totalUniqueVisitors = statsData.reduce((sum, stat) => sum + (stat.uniqueVisitors || 0), 0);
    const totalSubmissions = submissionsData.length;
    const conversionRate = totalVisits > 0 ? (totalSubmissions / totalVisits * 100).toFixed(2) : '0.00';

    // Calcular métricas por día
    const dailyStats = statsData.map(stat => ({
      date: stat.dateKey,
      visits: stat.totalVisits || 0,
      uniqueVisitors: stat.uniqueVisitors || 0,
      avgTimeOnPage: stat.avgTimeOnPage || 0,
      avgScrollDepth: stat.avgScrollDepth || 0
    }));

    // Calcular top referrers
    const referrers = statsData.reduce((acc, stat) => {
      if (stat.referrers) {
        Object.entries(stat.referrers).forEach(([referrer, count]) => {
          acc[referrer] = (acc[referrer] || 0) + count;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    const topReferrers = Object.entries(referrers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([referrer, count]) => ({ referrer, count }));

    // Calcular dispositivos
    const devices = statsData.reduce((acc, stat) => {
      if (stat.devices) {
        Object.entries(stat.devices).forEach(([device, count]) => {
          acc[device] = (acc[device] || 0) + count;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    // Calcular métricas de engagement
    const avgTimeOnPage = statsData.length > 0 
      ? statsData.reduce((sum, stat) => sum + (stat.avgTimeOnPage || 0), 0) / statsData.length 
      : 0;

    const avgScrollDepth = statsData.length > 0 
      ? statsData.reduce((sum, stat) => sum + (stat.avgScrollDepth || 0), 0) / statsData.length 
      : 0;

    // Calcular tendencias (comparar con período anterior)
    const previousPeriodStart = new Date(new Date(startDate).getTime() - (new Date(endDate).getTime() - new Date(startDate).getTime()));
    const previousStartDate = previousPeriodStart.toISOString().split('T')[0];

    const previousStatsQuery = db.collection('analytics_stats')
      .where('projectId', '==', projectId)
      .where('dateKey', '>=', previousStartDate)
      .where('dateKey', '<', startDate);

    const previousStatsSnapshot = await previousStatsQuery.get();
    const previousStatsData = previousStatsSnapshot.docs.map(doc => doc.data());
    const previousTotalVisits = previousStatsData.reduce((sum, stat) => sum + (stat.totalVisits || 0), 0);

    const visitsGrowth = previousTotalVisits > 0 
      ? ((totalVisits - previousTotalVisits) / previousTotalVisits * 100).toFixed(2)
      : '0.00';

    console.log('✅ Analytics retrieved successfully:', {
      projectId,
      period,
      totalVisits,
      totalSubmissions,
      conversionRate
    });

    return res.status(200).json({
      success: true,
      data: {
        period,
        summary: {
          totalVisits,
          totalUniqueVisitors,
          totalSubmissions,
          conversionRate: parseFloat(conversionRate),
          avgTimeOnPage: Math.round(avgTimeOnPage),
          avgScrollDepth: Math.round(avgScrollDepth),
          visitsGrowth: parseFloat(visitsGrowth)
        },
        dailyStats,
        topReferrers,
        devices,
        submissions: submissionsData.map(sub => ({
          id: sub.id,
          email: sub.email,
          productName: sub.productName,
          createdAt: sub.createdAt,
          status: sub.status || 'pending'
        }))
      }
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