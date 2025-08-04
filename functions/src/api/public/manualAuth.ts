// functions/src/api/public/manualAuth.ts

import { Request, Response } from "express";
import { setupManualAuth, setupManualAuthWithCode, testManualAuth } from "../../oauth/setupManualAuth";

export const manualAuth = async (req: Request, res: Response) => {
  try {
    const { action, code } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: action"
      });
    }

    let result;
    switch (action) {
      case 'setup':
        result = await setupManualAuth();
        break;
      
      case 'complete':
        if (!code) {
          return res.status(400).json({
            success: false,
            message: "Missing required parameter: code"
          });
        }
        result = await setupManualAuthWithCode(code);
        break;
      
      case 'test':
        result = await testManualAuth();
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action. Must be 'setup', 'complete', or 'test'"
        });
    }

    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result
    });

  } catch (error) {
    console.error('❌ Error in manualAuth:', error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 