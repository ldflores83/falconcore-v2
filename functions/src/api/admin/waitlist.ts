// /functions/src/api/admin/waitlist.ts

import { Request, Response } from "express";
import * as admin from 'firebase-admin';
import { ConfigService } from '../../services/configService';

const getFirestore = () => admin.firestore();

interface GetWaitlistRequest {
  projectId: string;
  clientId?: string;
}

interface GetWaitlistResponse {
  success: boolean;
  waitlist?: any[];
  message: string;
}

interface UpdateWaitlistStatusRequest {
  projectId: string;
  clientId?: string;
  entryId: string;
  newStatus: 'waiting' | 'notified' | 'converted';
}

interface UpdateWaitlistStatusResponse {
  success: boolean;
  message: string;
}

// Obtener lista de waitlist
export const getWaitlist = async (req: Request, res: Response) => {
  try {
    const { projectId }: GetWaitlistRequest = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: projectId"
      });
    }

    // Validar que el producto esté configurado
    if (!ConfigService.isProductConfigured(projectId)) {
      return res.status(400).json({
        success: false,
        message: `Product ${projectId} is not configured`
      });
    }

    // Validar que waitlist esté habilitado
    if (!ConfigService.isFeatureEnabled(projectId, 'waitlist')) {
      return res.status(400).json({
        success: false,
        message: `Waitlist feature is not enabled for ${projectId}`
      });
    }

    const db = getFirestore();
    const waitlistCollection = ConfigService.getCollectionName(projectId, 'waitlist');

    // Obtener waitlist entries ordenados por fecha de creación
    const waitlistSnapshot = await db.collection(waitlistCollection)
      .orderBy('timestamp', 'desc')
      .limit(100) // Limitar a 100 entradas para evitar timeouts
      .get();

    const waitlist: any[] = [];

    waitlistSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Procesar timestamp
      let timestamp: string;
      if (data.timestamp) {
        if (data.timestamp.toDate) {
          timestamp = data.timestamp.toDate().toISOString();
        } else if (data.timestamp instanceof Date) {
          timestamp = data.timestamp.toISOString();
        } else if (typeof data.timestamp === 'string') {
          timestamp = data.timestamp;
        } else {
          timestamp = new Date().toISOString();
        }
      } else {
        timestamp = new Date().toISOString();
      }

      waitlist.push({
        id: doc.id,
        email: data.email || data.userEmail || 'No email',
        projectId: data.projectId || projectId,
        status: data.status || 'waiting',
        timestamp: timestamp,
        name: data.name || data.userName || '',
        phone: data.phone || data.userPhone || '',
        source: data.source || 'unknown',
        ...data
      });
    });

    const response: GetWaitlistResponse = {
      success: true,
      waitlist,
      message: `Retrieved ${waitlist.length} waitlist entries for ${projectId}`
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error in getWaitlist:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Actualizar estado de entrada en waitlist
export const updateWaitlistStatus = async (req: Request, res: Response) => {
  try {
    const { projectId, entryId, newStatus }: UpdateWaitlistStatusRequest = req.body;

    if (!projectId || !entryId || !newStatus) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: projectId, entryId, newStatus"
      });
    }

    // Validar que el producto esté configurado
    if (!ConfigService.isProductConfigured(projectId)) {
      return res.status(400).json({
        success: false,
        message: `Product ${projectId} is not configured`
      });
    }

    // Validar que waitlist esté habilitado
    if (!ConfigService.isFeatureEnabled(projectId, 'waitlist')) {
      return res.status(400).json({
        success: false,
        message: `Waitlist feature is not enabled for ${projectId}`
      });
    }

    // Validar el status
    const validStatuses = ['waiting', 'notified', 'converted'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const db = getFirestore();
    const waitlistCollection = ConfigService.getCollectionName(projectId, 'waitlist');

    // Verificar que el documento existe
    const docRef = db.collection(waitlistCollection).doc(entryId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: `Waitlist entry with ID ${entryId} not found`
      });
    }

    // Actualizar el estado en Firestore
    await docRef.update({
      status: newStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'admin' // TODO: Add actual user ID when auth is implemented
    });

    const response: UpdateWaitlistStatusResponse = {
      success: true,
      message: `Status updated to ${newStatus} for entry ${entryId}`
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error in updateWaitlistStatus:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
