// /functions/src/api/public/getUsageStatus.ts

import { Request, Response } from "express";
// import { GoogleDriveProvider } from "../../storage/providers/GoogleDriveProvider"; // Temporalmente comentado

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

    const projectIdFinal = projectId || 'onboardingaudit';

    // TEMPORALMENTE: Retornar datos simulados hasta resolver Google Drive
    console.log('📊 Usage status requested (Google Drive temporalmente deshabilitado):', {
      projectId: projectIdFinal,
      timestamp: new Date().toISOString()
    });

    // Respuesta exitosa con datos simulados
    const response: GetUsageStatusResponse = {
      success: true,
      filesUploaded: 0,
      mbUsed: 0,
      resetIn: '24h',
      message: "Usage status retrieved successfully",
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error in getUsageStatus:", error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}; 