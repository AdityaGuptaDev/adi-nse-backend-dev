import { Request, Response, NextFunction } from 'express';
/*import { JWTUtil } from '../utils/jwt';
import { JWTPayload, AuthenticatedRequest } from '../types';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access token is required',
      error: 'UNAUTHORIZED'
    });
    return;
  }

  try {
    const decoded = JWTUtil.verifyToken(token);
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      });
      return;
    }

    // Check if user is banned
    if (decoded.userStatus === 'banned') {
      res.status(403).json({
        success: false,
        message: 'Your account is banned. Please contact support.',
        error: 'ACCOUNT_BANNED'
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'INVALID_TOKEN'
    });
  }
};

export const requireActiveUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'UNAUTHORIZED'
    });
    return;
  }

  if (req.user.userStatus !== 'active') {
    res.status(403).json({
      success: false,
      message: 'Account is not active',
      error: 'ACCOUNT_INACTIVE'
    });
    return;
  }

  next();
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = JWTUtil.verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    } catch (error) {
      // Silently ignore invalid tokens for optional auth
    }
  }

  next();
}; */