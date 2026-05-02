import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET || ADMIN_SECRET === 'fallback') {
  console.warn('⚠️ WARNING: ADMIN_SECRET is not set or using fallback value. This is INSECURE.');
}

export const verifyAdminAuth = (auth: string, sessionId?: string) => {
  if (!auth || !ADMIN_SECRET) return false;
  
  // 1. Master Admin token check
  const masterToken = crypto.createHmac('sha256', ADMIN_SECRET).update('MASTER_ADMIN').digest('hex');
  if (auth === masterToken) return true;

  // 2. Session-specific token check
  if (sessionId) {
    const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(sessionId).digest('hex');
    return auth === expected;
  }
  
  return false;
};

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const queryAuth = req.query.auth as string;
  const sessionId = (req.params.id || req.query.sessionId) as string;

  let token = '';
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (queryAuth) {
    token = queryAuth;
  }

  if (verifyAdminAuth(token, sessionId)) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized access' });
};
