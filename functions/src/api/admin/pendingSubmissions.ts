// functions/src/api/admin/pendingSubmissions.ts

import { Request, Response } from "express";
import { getOAuthCredentials } from '../../oauth/getOAuthCredentials';
import * as admin from 'firebase-admin';

// Función para obtener Firestore de forma lazy
const getFirestore = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'falconcore-v2',
    });
  }
  return admin.firestore();
};

export const getPendingSubmissions = async (req: Request, res: Response) => {
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
        message: "Access denied. Only authorized administrators can access submissions."
      });
    }

    // Verificar credenciales OAuth
    const credentials = await getOAuthCredentials(userId);
    
    if (!credentials) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login first."
      });
    }

    // Obtener submissions pendientes desde Firestore
    const db = getFirestore();
    
    console.log('📋 Loading pending submissions from Firestore...');
    
    const snapshot = await db.collection('onboardingaudit_submissions')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();
    
    console.log('📋 Pending submissions found:', {
      totalPending: snapshot.docs.length,
      submissionIds: snapshot.docs.map(doc => doc.id)
    });
    
    const pendingSubmissions = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📋 Processing pending submission:', {
        id: doc.id,
        email: data.email,
        productName: data.productName,
        status: data.status
      });
      
      return {
        id: doc.id,
        email: data.email || 'Unknown',
        productName: data.productName || 'Unknown',
        productUrl: data.productUrl || '',
        targetUser: data.targetUser || 'Unknown',
        mainGoal: data.mainGoal || 'Unknown',
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
        status: data.status || 'pending',
        documentPath: data.documentPath || null,
        documentUrl: data.documentUrl || null
      };
    });

    console.log('✅ Pending submissions loaded:', {
      projectId,
      userId,
      pendingCount: pendingSubmissions.length
    });

    return res.status(200).json({
      success: true,
      pendingSubmissions,
      pendingCount: pendingSubmissions.length
    });

  } catch (error) {
    console.error('❌ Error loading pending submissions:', error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to load pending submissions",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 