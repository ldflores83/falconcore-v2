// functions/src/api/admin/submissions.ts

import { Request, Response } from 'express';
import { getOAuthCredentials } from '../../oauth/getOAuthCredentials';
import { generateClientId } from '../../utils/hash';
import * as admin from 'firebase-admin';
import { ConfigService } from '../../services/configService';

const getFirestore = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'falconcore-v2',
    });
  }
  return admin.firestore();
};

export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { projectId, clientId } = req.body;

    if (!projectId || !clientId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: projectId and clientId"
      });
    }

    // Validar que el proyecto esté configurado
    if (!ConfigService.isProductConfigured(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project configuration"
      });
    }

    // Validar que las características necesarias estén habilitadas
    if (!ConfigService.isFeatureEnabled(projectId, 'adminPanel')) {
      return res.status(400).json({
        success: false,
        message: "Admin panel is not enabled for this project"
      });
    }

    // Verificar que el clientId corresponde al email autorizado
    const expectedClientId = generateClientId('luisdaniel883@gmail.com', projectId);
    if (clientId !== expectedClientId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only authorized administrators can access submissions."
      });
    }

    // Verificar credenciales OAuth
    const credentials = await getOAuthCredentials(clientId);
    
    if (!credentials) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login first."
      });
    }

    // Obtener submissions desde Firestore (fuente de verdad para el dashboard)
    const db = getFirestore();
    
    console.log('📁 Loading submissions from Firestore...');
    
    // Obtener todas las submissions de Firestore
    const collectionName = ConfigService.getCollectionName(projectId, 'submissions');
    const snapshot = await db.collection(collectionName)
      .orderBy('createdAt', 'desc')
      .get();
    
    const submissions = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Mapear campos del formulario de onboarding audit
      const email = data.report_email || data.email || 'Unknown';
      const productName = data.product_name || data.productName || 'Unknown';
      const targetUser = data.target_user || data.targetUser || 'Unknown';
      const mainGoal = data.main_goal || data.mainGoal || 'Unknown';
      
      // Manejar fechas correctamente
      let createdAt;
      if (data.createdAt?.toDate) {
        createdAt = data.createdAt.toDate();
      } else if (data.createdAt instanceof Date) {
        createdAt = data.createdAt;
      } else if (data.createdAt) {
        createdAt = new Date(data.createdAt);
      } else {
        createdAt = new Date();
      }
      
      return {
        id: doc.id,
        email: email,
        productName: productName,
        productUrl: data.signup_link || data.productUrl || '',
        targetUser: targetUser,
        mainGoal: mainGoal,
        createdAt: createdAt,
        status: data.status || 'pending',
        folderId: data.driveFolderId || data.documentPath || null
      };
    });
    
    console.log('📁 Submissions loaded from Firestore:', {
      projectId,
      clientId,
      submissionsCount: submissions.length,
      submissions: submissions.map(s => ({ id: s.id, email: s.email, status: s.status }))
    });
    
    // También obtener submissions pendientes desde Firestore para el contador
    const pendingSnapshot = await db.collection(collectionName)
      .where('status', '==', 'pending')
      .get();
    
    const pendingCount = pendingSnapshot.docs.length;
    
    console.log('✅ Admin submissions loaded with pending count:', {
      projectId,
      clientId,
      submissionsCount: submissions.length,
      pendingCount
    });
    
    return res.status(200).json({
      success: true,
      submissions,
      pendingCount
    });

  } catch (error) {
    console.error('❌ Error loading admin submissions:', error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to load submissions",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 