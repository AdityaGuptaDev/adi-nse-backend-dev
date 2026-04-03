import { Request, Response, NextFunction } from 'express';

// Additional security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy (basic)
    res.setHeader('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none';"
    );

    // Permissions policy
    res.setHeader('Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), speaker=(), fullscreen=()'
    );

    // Remove server information
    res.removeHeader('X-Powered-By');

    next();
};

// Strict security headers for sensitive endpoints
export const strictSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // Apply all standard security headers
    securityHeaders(req, res, (err?: any) => {
        if (err) return next(err);

        // Additional strict headers for sensitive endpoints
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Strict CSP for auth endpoints
        res.setHeader('Content-Security-Policy',
            "default-src 'none'; " +
            "script-src 'self'; " +
            "style-src 'self'; " +
            "img-src 'self'; " +
            "connect-src 'self'; " +
            "frame-ancestors 'none';"
        );

        next();
    });
};