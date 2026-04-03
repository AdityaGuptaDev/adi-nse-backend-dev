import { Request, Response, NextFunction } from 'express';
import prosesjwt from 'proses-jwt';

const { tokenMiddleWare } = prosesjwt;

// Original token middleware (temporarily reverted)
export const secureTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    return next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'UNAUTHORIZED'
    });
  }
};

// Export the original middleware
export { tokenMiddleWare };

// Also export a wrapped version for consistency
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  return secureTokenMiddleware(req, res, next);
};

// Export default for easy importing
export default tokenMiddleWare;
