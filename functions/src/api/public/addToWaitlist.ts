// /functions/src/api/public/waitlist.ts

import { Request, Response } from "express";
import * as admin from 'firebase-admin';
import { ConfigService } from "../../services/configService";

// Función para obtener Firestore de forma lazy
const getFirestore = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: 'falconcore-v2',
    });
  }
  return admin.firestore();
};

// Tipos para el waitlist
interface WaitlistEntry {
  email: string;
  projectId: string;
  name?: string;
  productName?: string;
  website?: string;
  language?: string;
  timestamp: Date;
  status: 'waiting' | 'notified' | 'converted';
  [key: string]: any; // Permitir campos adicionales
}

interface CheckLimitRequest {
  projectId: string;
}

interface CheckLimitResponse {
  success: boolean;
  canSubmit: boolean;
  activeSubmissions: number;
  limit: number;
  message: string;
}

interface AddToWaitlistRequest {
  email: string;
  projectId: string;
  name?: string;
  productName?: string;
  website?: string;
  language?: string;
  [key: string]: any; // Permitir campos adicionales
}

interface AddToWaitlistResponse {
  success: boolean;
  message: string;
  entryId?: string;
}

// Verificar si se puede enviar el formulario
export const checkLimit = async (req: Request, res: Response) => {
  console.log('🔍 checkLimit handler called with:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });

  try {
    const { projectId }: CheckLimitRequest = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: projectId"
      });
    }

    const db = getFirestore();
    
    // Validar que el proyecto esté configurado
    if (!ConfigService.isProductConfigured(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project configuration"
      });
    }

    // Validar que las características necesarias estén habilitadas
    if (!ConfigService.isFeatureEnabled(projectId, 'waitlist')) {
      return res.status(400).json({
        success: false,
        message: "Waitlist is not enabled for this project"
      });
    }

    const limit = 6; // Límite configurable

    // Contar submissions activas (pending, synced, in_progress)
    const collectionName = ConfigService.getCollectionName(projectId, 'submissions');
    const submissionsSnapshot = await db
      .collection(collectionName)
      .where('projectId', '==', projectId)
      .where('status', 'in', ['pending', 'synced', 'in_progress'])
      .get();

    const activeSubmissions = submissionsSnapshot.size;
    const canSubmit = activeSubmissions < limit;

    console.log('📊 Limit check result:', {
      projectId,
      activeSubmissions,
      limit,
      canSubmit
    });

    const response: CheckLimitResponse = {
      success: true,
      canSubmit,
      activeSubmissions,
      limit,
      message: canSubmit 
        ? `You can submit your request. Currently ${activeSubmissions} active submissions.`
        : `We're currently working on ${activeSubmissions} other reports. Please join our waitlist to be notified when a slot becomes available.`
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error in checkLimit:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// Agregar entrada al waitlist
export const addToWaitlist = async (req: Request, res: Response) => {
  console.log('➕ addToWaitlist handler called with:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });

  try {
    const { email, projectId, name, productName, website, language, ...additionalFields }: AddToWaitlistRequest = req.body;

    // Validaciones - solo email y projectId son obligatorios
    if (!email || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, projectId"
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const db = getFirestore();

    // Validar que el proyecto esté configurado
    if (!ConfigService.isProductConfigured(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project configuration"
      });
    }

    // Validar que las características necesarias estén habilitadas
    if (!ConfigService.isFeatureEnabled(projectId, 'waitlist')) {
      return res.status(400).json({
        success: false,
        message: "Waitlist is not enabled for this project"
      });
    }

    // Determinar la colección basada en el projectId
    const collectionName = ConfigService.getCollectionName(projectId, 'waitlist');
    
    // Verificar si ya existe en waitlist
    const existingEntry = await db
      .collection(collectionName)
      .where('email', '==', email)
      .where('projectId', '==', projectId)
      .get();

    if (!existingEntry.empty) {
      return res.status(400).json({
        success: false,
        message: "You're already on the waitlist for this project"
      });
    }

    // Crear entrada en waitlist con todos los campos disponibles
    const waitlistData: WaitlistEntry = {
      email,
      projectId,
      timestamp: new Date(),
      status: 'waiting',
      ...(name && { name }),
      ...(productName && { productName }),
      ...(website && { website }),
      ...(language && { language }),
      ...additionalFields // Incluir cualquier campo adicional
    };

    const docRef = await db.collection(collectionName).add(waitlistData);
    
    console.log('✅ Waitlist entry added:', {
      entryId: docRef.id,
      email,
      productName,
      projectId
    });

    const response: AddToWaitlistResponse = {
      success: true,
      message: "Successfully added to waitlist. We'll notify you when a slot becomes available!",
      entryId: docRef.id
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error in addToWaitlist:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
