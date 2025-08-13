// functions/src/api/public/manualAuth.ts

import { Request, Response } from 'express';
import { setupManualAuth, setupManualAuthWithCode, testManualAuth } from '../../oauth/setupManualAuth';

export const manualAuth = async (req: Request, res: Response) => {
  try {
    const { action, code, project_id, email } = req.body;

    switch (action) {
      case 'setup':
        if (!project_id) {
          return res.status(400).json({
            success: false,
            message: "Missing project_id parameter"
          });
        }
        return await setupManualAuth(req, res);

      case 'setupWithCode':
        if (!code || !project_id || !email) {
          return res.status(400).json({
            success: false,
            message: "Missing required parameters for setup with code"
          });
        }
        return await setupManualAuthWithCode(req, res);

      case 'test':
        if (!project_id || !email) {
          return res.status(400).json({
            success: false,
            message: "Missing required parameters for test"
          });
        }
        return await testManualAuth(req, res);

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action. Use 'setup', 'setupWithCode', or 'test'"
        });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Manual auth operation failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}; 