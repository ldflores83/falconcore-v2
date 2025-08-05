import { Request, Response } from "express";
import { GoogleDriveProvider } from "../../storage/providers/GoogleDriveProvider";
import { getOAuthCredentials } from "../../oauth/getOAuthCredentials";

interface CheckSubmissionStatusRequest {
  projectId?: string;
}

interface CheckSubmissionStatusResponse {
  success: boolean;
  canSubmit: boolean;
  pendingCount: number;
  maxPending: number;
  message?: string;
}

export const checkSubmissionStatus = async (req: Request, res: Response) => {
  console.log('🚀 checkSubmissionStatus handler called with:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  
  try {
    const { projectId }: CheckSubmissionStatusRequest = req.body;
    const projectIdFinal = projectId || 'onboardingaudit';
    const maxPending = 6;

    // Get admin OAuth credentials
    const adminUserId = `luisdaniel883@gmail.com_${projectIdFinal}`;
    const credentials = await getOAuthCredentials(adminUserId);
    
    if (!credentials) {
      console.log('⚠️ No OAuth credentials found for admin user:', adminUserId);
      return res.status(500).json({
        success: false,
        canSubmit: false,
        pendingCount: 0,
        maxPending,
        message: "Service temporarily unavailable. Please try again later."
      });
    }

    // Get admin folder and count pending submissions
    const provider = new GoogleDriveProvider();
    const adminFolderId = await provider.createFolderWithTokens(
      'luisdaniel883@gmail.com', 
      projectIdFinal, 
      credentials.accessToken,
      credentials.refreshToken
    );
    
    // List all subfolders to count pending submissions
    const folders = await provider.listFilesWithTokens(
      adminFolderId, 
      credentials.accessToken,
      credentials.refreshToken
    );
    
    // Count pending submissions (folders)
    const pendingSubmissions = folders.filter(folder => 
      folder.mimeType === 'application/vnd.google-apps.folder'
    );
    
    const pendingCount = pendingSubmissions.length;
    const canSubmit = pendingCount < maxPending;
    
    console.log('📊 Submission status check:', {
      projectId: projectIdFinal,
      pendingCount,
      maxPending,
      canSubmit
    });

    const response: CheckSubmissionStatusResponse = {
      success: true,
      canSubmit,
      pendingCount,
      maxPending,
      message: canSubmit 
        ? undefined 
        : `We are currently working on ${pendingCount} pending requests. Please try again later when more slots become available.`
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ Error in checkSubmissionStatus:", error);
    
    return res.status(500).json({
      success: false,
      canSubmit: false,
      pendingCount: 0,
      maxPending: 6,
      message: "Internal server error. Please try again later."
    });
  }
}; 