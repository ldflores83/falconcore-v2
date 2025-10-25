import { auth } from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

export async function verifyFirebaseIdToken(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || '';
  const m = hdr.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ code: 'auth/missing-bearer' });

  try {
    const decoded = await auth().verifyIdToken(m[1], true); // checkRevoked=true (opcional)
    (req as any).auth = { uid: decoded.uid, email: decoded.email ?? null, claims: decoded };
    return next();
  } catch (err) {
    return res.status(401).json({ code: 'auth/invalid-token' });
  }
}
