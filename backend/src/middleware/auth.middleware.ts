import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.log('❌ Auth failed: No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    console.log('✅ Token verified for user:', decoded.userId, 'role:', decoded.role);
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.log('❌ Auth failed: Invalid token -', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorizeRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    console.log('🔐 Role check: user role =', userRole, ', required roles =', roles);
    if (!roles.includes(userRole)) {
      console.log('❌ Access denied: role mismatch');
      return res.status(403).json({ error: 'Access denied' });
    }
    console.log('✅ Role authorized');
    next();
  };
};
