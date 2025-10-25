import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

export async function verifyFirebaseIdToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'missing-auth-token',
        message: 'Authorization header with Bearer token is required'
      }
    });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'invalid-auth-token',
        message: 'Invalid or expired authentication token'
      }
    });
  }
}

export async function enforceTenantMembership(req: Request, res: Response, next: NextFunction) {
  const { user } = (req as any);
  const tenantId = req.params.tenantId || req.body.tenantId;
  
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
    const db = admin.firestore();
    const memberDoc = await db.doc(`tenants/${tenantId}/members/${user.uid}`).get();
    
    if (!memberDoc.exists) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'tenant-access-denied',
          message: 'User does not have access to this tenant'
        }
      });
    }

    const memberData = memberDoc.data();
    if (memberData?.status !== 'active' && memberData?.status !== 'invited') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'inactive-member',
          message: 'User membership is not active'
        }
      });
    }

    (req as any).context = {
      ...(req as any).context,
      tenantId,
      userRole: memberData?.role || 'member',
      memberData
    };

    next();
  } catch (error) {
    console.error('Error enforcing tenant membership:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Internal server error'
      }
    });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const context = (req as any).context;
  
  if (!context || context.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'admin-required',
        message: 'Admin access required'
      }
    });
  }

  next();
}
