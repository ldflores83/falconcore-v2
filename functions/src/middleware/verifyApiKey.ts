import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

const getDb = () => admin.firestore();

export async function verifyApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'missing-api-key',
        message: 'API key is required'
      }
    });
  }

  try {
    const db = getDb();
    
    // Buscar tenant por API key
    const tenantsSnapshot = await db.collection('tenants')
      .where('apiKey', '==', apiKey)
      .limit(1)
      .get();

    if (tenantsSnapshot.empty) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'invalid-api-key',
          message: 'Invalid API key'
        }
      });
    }

    const tenantDoc = tenantsSnapshot.docs[0];
    const tenantData = tenantDoc.data();

    // Verificar límite de requests diarios
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `usage.${today}`;
    const currentUsage = tenantData[usageKey] || 0;

    if (currentUsage >= 100) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'rate-limit-exceeded',
          message: 'Daily request limit exceeded (100 requests/day)'
        }
      });
    }

    // Incrementar contador de uso
    await tenantDoc.ref.update({
      [usageKey]: currentUsage + 1
    });

    // Adjuntar información del tenant al request
    (req as any).tenant = {
      id: tenantDoc.id,
      name: tenantData.name,
      apiKey: apiKey
    };

    next();
  } catch (error) {
    console.error('Error verifying API key:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'internal-error',
        message: 'Failed to verify API key'
      }
    });
  }
}
