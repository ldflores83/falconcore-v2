import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

export async function verifyTenantAccess(req: Request, res: Response, next: NextFunction) {
  const { uid } = (req as any).auth;
  const tenantId = req.body?.tenantId || req.query?.tenantId;

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'missing-tenant-id',
        message: 'Tenant ID is required'
      }
    });
  }

  try {
    const getDb = () => admin.firestore();
    const userDoc = await getDb().doc(`tenants/${tenantId}/users/${uid}`).get();
    
    if (!userDoc.exists) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'tenant-access-denied',
          message: 'User does not have access to this tenant'
        }
      });
    }

    const userData = userDoc.data() as any;
    (req as any).context = {
      ...(req as any).context,
      tenantId,
      role: userData.role,
      userStatus: userData.status
    };

    next();
  } catch (error) {
    console.error('Error verifying tenant access:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Internal server error'
      }
    });
  }
}

export async function verifyAdminAccess(req: Request, res: Response, next: NextFunction) {
  const context = (req as any).context;
  
  if (!context || context.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'admin-access-required',
        message: 'Admin access required'
      }
    });
  }

  next();
}
