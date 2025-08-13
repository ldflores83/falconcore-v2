// /functions/src/api/admin/waitlist.ts

import { Request, Response } from "express";
import { getOAuthCredentials } from "../../oauth/getOAuthCredentials";
import { isProjectAdmin } from "../../config/projectAdmins";
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

interface GetWaitlistRequest {
  projectId: string;
  clientId: string;
}

interface GetWaitlistResponse {
  success: boolean;
  waitlist?: any[];
  message: string;
}

interface UpdateWaitlistStatusRequest {
  projectId: string;
  clientId: string;
  entryId: string;
  newStatus: 'waiting' | 'notified' | 'converted';
}

interface UpdateWaitlistStatusResponse {
  success: boolean;
  message: string;
}

// Obtener lista de waitlist
export const getWaitlist = async (req: Request, res: Response) => {
  console.log('📋 getWaitlist handler called with:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });

  try {
    const { projectId, clientId }: GetWaitlistRequest = req.body;

    console.log('🔍 getWaitlist: Received parameters:', { projectId, clientId });

    if (!projectId || !clientId) {
      console.log('❌ getWaitlist: Missing required parameters');
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: projectId, clientId"
      });
    }

    console.log('🔐 getWaitlist: Verifying OAuth credentials for clientId:', clientId);
    
    // Verificar credenciales OAuth
    const credentials = await getOAuthCredentials(clientId);
    
    console.log('🔐 getWaitlist: OAuth credentials result:', {
      hasCredentials: !!credentials,
      email: credentials?.email,
      projectId: credentials?.projectId
    });
    
    if (!credentials) {
      console.log('❌ getWaitlist: No OAuth credentials found');
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login first."
      });
    }

    console.log('🔐 getWaitlist: Checking admin permissions for:', {
      email: credentials.email,
      projectId: credentials.projectId,
      targetProjectId: projectId
    });

    // Verificar que el usuario es admin del proyecto
    const isAdmin = isProjectAdmin(credentials.email, credentials.projectId);
    console.log('🔐 getWaitlist: Admin check result:', { isAdmin });
    
    if (!isAdmin) {
      console.log('❌ getWaitlist: User is not admin');
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized as an administrator for this project."
      });
    }

    console.log('🗄️ getWaitlist: Getting Firestore instance');
    const db = getFirestore();

    console.log('🗄️ getWaitlist: Querying waitlist collection for projectId:', projectId);
    
    // Obtener waitlist del proyecto
    console.log('🗄️ getWaitlist: Querying waitlist collection...');
    
    let waitlistSnapshot;
    try {
      // Intentar con orderBy primero
      waitlistSnapshot = await db
        .collection('waitlist_onboarding_audit')
        .where('projectId', '==', projectId)
        .orderBy('timestamp', 'desc')
        .get();
      
      console.log('🗄️ getWaitlist: Query with orderBy successful');
    } catch (queryError) {
      console.log('🗄️ getWaitlist: Query with orderBy failed, trying without orderBy...', queryError);
      
      // Si falla con orderBy, intentar sin ordenamiento
      waitlistSnapshot = await db
        .collection('waitlist_onboarding_audit')
        .where('projectId', '==', projectId)
        .get();
        
      console.log('🗄️ getWaitlist: Query without orderBy successful');
    }

    console.log('🗄️ getWaitlist: Firestore query completed, docs count:', waitlistSnapshot.size);

    const waitlist = waitlistSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
    }));

    console.log('🗄️ getWaitlist: Processed waitlist data:', {
      count: waitlist.length,
      sampleEntry: waitlist.length > 0 ? waitlist[0] : null
    });

    console.log('✅ Waitlist retrieved:', {
      projectId,
      count: waitlist.length
    });

    const response: GetWaitlistResponse = {
      success: true,
      waitlist,
      message: `Retrieved ${waitlist.length} waitlist entries`
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error in getWaitlist:", error);
    
    // Log más detalles del error
    if (error instanceof Error) {
      console.error("❌ getWaitlist error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Actualizar estado de entrada en waitlist
export const updateWaitlistStatus = async (req: Request, res: Response) => {
  console.log('🔄 updateWaitlistStatus handler called with:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });

  try {
    const { projectId, clientId, entryId, newStatus }: UpdateWaitlistStatusRequest = req.body;

    if (!projectId || !clientId || !entryId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: projectId, clientId, entryId, newStatus"
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

    // Verificar que el usuario es admin del proyecto
    if (!isProjectAdmin(credentials.email, credentials.projectId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized as an administrator for this project."
      });
    }

    const db = getFirestore();

    // Actualizar estado en Firestore
    await db
      .collection('waitlist_onboarding_audit')
      .doc(entryId)
      .update({
        status: newStatus,
        updatedAt: new Date()
      });

    console.log('✅ Waitlist status updated:', {
      entryId,
      newStatus,
      projectId
    });

    const response: UpdateWaitlistStatusResponse = {
      success: true,
      message: `Waitlist entry status updated to ${newStatus}`
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error in updateWaitlistStatus:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
