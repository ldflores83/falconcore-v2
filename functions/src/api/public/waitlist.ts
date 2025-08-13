// /functions/src/api/public/waitlist.ts

import { Request, Response } from "express";
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

// Tipos para el waitlist
interface WaitlistEntry {
  productName: string;
  website: string;
  email: string;
  projectId: string;
  timestamp: Date;
  status: 'waiting' | 'notified' | 'converted';
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
  productName: string;
  website: string;
  email: string;
  projectId: string;
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
    const limit = 6; // Límite configurable

    // Contar submissions activas (pending, synced, in_progress)
    const submissionsSnapshot = await db
      .collection('onboardingaudit_submissions')
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
    const { productName, website, email, projectId }: AddToWaitlistRequest = req.body;

    // Validaciones
    if (!productName || !website || !email || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productName, website, email, projectId"
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

    // Verificar si ya existe en waitlist
    const existingEntry = await db
      .collection('waitlist_onboarding_audit')
      .where('email', '==', email)
      .where('projectId', '==', projectId)
      .get();

    if (!existingEntry.empty) {
      return res.status(400).json({
        success: false,
        message: "You're already on the waitlist for this project"
      });
    }

    // Crear entrada en waitlist
    const waitlistData: WaitlistEntry = {
      productName,
      website,
      email,
      projectId,
      timestamp: new Date(),
      status: 'waiting'
    };

    const docRef = await db.collection('waitlist_onboarding_audit').add(waitlistData);
    
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
