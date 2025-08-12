// functions/src/api/auth/getClientId.ts

import { Request, Response } from 'express';
import { generateClientId } from '../../utils/hash';

export const getClientId = async (req: Request, res: Response) => {
  try {
    const { email, projectId } = req.body;

    if (!email || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: email and projectId"
      });
    }

    // Generate clientId for the user
    const clientId = generateClientId(email, projectId);

    return res.status(200).json({
      success: true,
      message: "ClientId generated successfully",
      data: {
        clientId,
        email,
        projectId
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate clientId",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
