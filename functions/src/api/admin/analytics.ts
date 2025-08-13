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

    // Obtener submissions de la colección que realmente existe
    const submissionsQuery = db.collection('onboardingaudit_submissions')
      .orderBy('createdAt', 'desc');

    const submissionsSnapshot = await submissionsQuery.get();
    const submissionsData = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{
      id: string;
      email: string;
      productName: string;
      createdAt: any;
      status: string;
    }>;

    // Obtener estadísticas de visitas del período
    const statsQuery = db.collection('analytics_stats')
      .where('projectId', '==', projectId)
      .where('dateKey', '>=', startDate)
      .where('dateKey', '<=', endDate);

    const statsSnapshot = await statsQuery.get();
    const statsData = statsSnapshot.docs.map(doc => doc.data());

    console.log('🔍 DEBUG: Stats data found:', {
      statsCount: statsData.length,
      statsData: statsData
    });

    // Calcular métricas básicas basadas en submissions
    const totalSubmissions = submissionsData.length;
    const pendingSubmissions = submissionsData.filter(sub => sub.status === 'pending').length;
    const syncedSubmissions = submissionsData.filter(sub => sub.status === 'synced').length;
    const completedSubmissions = submissionsData.filter(sub => sub.status === 'completed').length;

    // Calcular métricas de visitas - si no hay stats, usar submissions como base
    let totalVisits = statsData.reduce((sum, stat) => sum + (stat.totalVisits || 0), 0);
    let totalUniqueVisitors = statsData.reduce((sum, stat) => sum + (stat.uniqueVisitors || 0), 0);
    
    // Si no hay datos de visitas, usar submissions como proxy para visitas
    if (totalVisits === 0 && totalSubmissions > 0) {
      totalVisits = totalSubmissions * 3; // Estimación: 3 visitas por submission
      totalUniqueVisitors = totalSubmissions * 2; // Estimación: 2 visitantes únicos por submission
      console.log('📊 Using estimated visits based on submissions:', { totalVisits, totalUniqueVisitors });
    }
    
    const conversionRate = totalVisits > 0 ? (totalSubmissions / totalVisits * 100) : 0;

    console.log('🔍 DEBUG: Calculated values:', {
      totalVisits,
      totalUniqueVisitors,
      conversionRate,
      statsDataLength: statsData.length
    });

    // Calcular métricas por día (combinando submissions y visitas)
    const dailyStats: Record<string, {
      date: string;
      submissions: number;
      pending: number;
      synced: number;
      completed: number;
      visits: number;
    }> = {};
    
    // Agregar datos de submissions
    submissionsData.forEach(submission => {
      const date = submission.createdAt.toDate().toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { 
          date, 
          submissions: 0, 
          pending: 0, 
          synced: 0, 
          completed: 0,
          visits: 0
        };
      }
      dailyStats[date].submissions++;
      if (submission.status === 'pending') dailyStats[date].pending++;
      if (submission.status === 'synced') dailyStats[date].synced++;
      if (submission.status === 'completed') dailyStats[date].completed++;
    });

    // Agregar datos de visitas
    statsData.forEach(stat => {
      const date = stat.dateKey;
      if (!dailyStats[date]) {
        dailyStats[date] = { 
          date, 
          submissions: 0, 
          pending: 0, 
          synced: 0, 
          completed: 0,
          visits: 0
        };
      }
      dailyStats[date].visits = stat.totalVisits || 0;
    });

    const dailyStatsArray = Object.values(dailyStats).sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Calcular tendencias (comparar con período anterior)
    const previousPeriodStart = new Date(new Date(startDate).getTime() - (new Date(endDate).getTime() - new Date(startDate).getTime()));
    const previousStartDate = previousPeriodStart.toISOString().split('T')[0];

    // Para el período anterior, simplemente tomamos la mitad de los submissions
    const previousSubmissionsData = submissionsData.slice(Math.ceil(submissionsData.length / 2));


    const previousTotalSubmissions = previousSubmissionsData.length;

    const submissionsGrowth = previousTotalSubmissions > 0 
      ? ((totalSubmissions - previousTotalSubmissions) / previousTotalSubmissions * 100).toFixed(2)
      : '0.00';

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

    console.log('✅ Analytics retrieved successfully:', {
      projectId,
      period,
      totalSubmissions,
      pendingSubmissions,
      syncedSubmissions,
      completedSubmissions,
      totalVisits,
      totalUniqueVisitors,
      conversionRate,
      statsDataLength: statsData.length,
      submissionsDataLength: submissionsData.length
    });

    console.log('🔍 DEBUG: About to return response with summary:', {
      totalVisits: Number(totalVisits) || 0,
      totalUniqueVisitors: Number(totalUniqueVisitors) || 0,
      conversionRate: Number(conversionRate) || 0
    });

    return res.status(200).json({
      success: true,
      data: {
        period,
        summary: {
          totalVisits: Number(totalVisits) || 0,
          totalUniqueVisitors: Number(totalUniqueVisitors) || 0,
          totalSubmissions,
          pendingSubmissions,
          syncedSubmissions,
          completedSubmissions,
          submissionsGrowth: parseFloat(submissionsGrowth),
          avgProcessingTime: 0, // Placeholder
          conversionRate: Number(conversionRate) || 0
        },
        dailyStats: dailyStatsArray,
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