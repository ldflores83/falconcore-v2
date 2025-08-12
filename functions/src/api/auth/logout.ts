// functions/src/api/auth/logout.ts

import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

export const logout = async (req: Request, res: Response) => {
  try {
    const { sessionToken } = req.body;

    if (sessionToken) {
      // Eliminar la sesión de administrador
      await admin.firestore().collection('admin_sessions').doc(sessionToken).delete();
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}; 