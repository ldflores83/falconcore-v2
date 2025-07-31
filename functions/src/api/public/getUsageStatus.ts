// /functions/src/api/public/getUsageStatus.ts

import { Request, Response } from "express";
import { GoogleDriveProvider } from "../../storage/providers/GoogleDriveProvider";
import { google } from "googleapis";
import { getValidAccessToken } from "../../oauth/getOAuthCredentials";

interface GetUsageStatusRequest {
  projectId?: string;
}

interface GetUsageStatusResponse {
  success: boolean;
  filesUploaded?: number;
  mbUsed?: number;
  resetIn?: string;
  message: string;
}

export const getUsageStatus = async (req: Request, res: Response) => {
  try {
    const { projectId }: GetUsageStatusRequest = req.body;

    // Obtener credenciales OAuth del usuario registrado (tu cuenta)
    const userId = process.env.ONBOARDING_AUDIT_USER_ID || 'default_user';
    const projectIdFinal = projectId || 'onboardingaudit';
    
    const accessToken = await getValidAccessToken(userId, projectIdFinal);
    if (!accessToken) {
      console.error("No valid OAuth credentials found for onboarding audit");
      return res.status(500).json({
        success: false,
        message: "Service not configured properly. Please contact support."
      });
    }

    // Configurar Google APIs con tus credenciales
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    const slides = google.slides({ version: 'v1', auth: oauth2Client });

    // Crear provider de storage con tus credenciales
    const storageProvider = new GoogleDriveProvider(accessToken, drive, docs, slides);

    // Obtener estadísticas de uso general (no específicas por email)
    const usageStats = await storageProvider.getUsageStats('onboardingaudit', projectIdFinal);

    // Calcular tiempo hasta reset (24 horas desde el archivo más antiguo)
    const now = new Date();
    const resetTime = new Date(usageStats.lastReset);
    resetTime.setHours(resetTime.getHours() + 24); // Reset cada 24 horas

    const timeUntilReset = resetTime.getTime() - now.getTime();
    const hoursUntilReset = Math.max(0, Math.floor(timeUntilReset / (1000 * 60 * 60)));

    // Respuesta exitosa
    const response: GetUsageStatusResponse = {
      success: true,
      filesUploaded: usageStats.filesCount,
      mbUsed: Math.round(usageStats.totalSize / 1024 / 1024 * 100) / 100,
      resetIn: `${hoursUntilReset}h`,
      message: "Usage status retrieved successfully",
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error in getUsageStatus:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}; 