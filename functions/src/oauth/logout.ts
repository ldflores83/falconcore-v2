// functions/src/oauth/logout.ts

import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

export const logout = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Missing clientId parameter"
      });
    }

    // Eliminar credenciales OAuth de Firestore
    await admin.firestore()
      .collection('oauth_credentials')
      .doc(clientId)
      .delete();

    return res.status(200).json({
      success: true,
      message: "OAuth logout successful",
      data: {
        clientId
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "OAuth logout failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}; 