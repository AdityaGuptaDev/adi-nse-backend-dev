import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
    ip: string;
    count: number;
    resetTime: number;
}

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message?: string;
}

// Pre-defined rate limit tiers
export const RateLimitTiers = {
    // Auth & OTP: strict - brute force protection
    AUTH: { windowMs: 2 * 60 * 1000, maxRequests: 3, message: 'Too many authentication attempts, please try again later' },
    // Financial transactions: strict - prevent abuse of money movement
    FINANCIAL: { windowMs: 15 * 60 * 1000, maxRequests: 30, message: 'Too many transaction requests, please try again later' },
    // KYC & verification: moderate - external API cost + abuse prevention
    KYC: { windowMs: 15 * 60 * 1000, maxRequests: 20, message: 'Too many verification requests, please try again later' },
    // File upload: strict - resource heavy
    UPLOAD: { windowMs: 15 * 60 * 1000, maxRequests: 15, message: 'Too many upload requests, please try again later' },
    // Data write (CRUD): standard write protection
    DATA_WRITE: { windowMs: 15 * 60 * 1000, maxRequests: 100, message: 'Too many write requests, please try again later' },
    // Data read (authenticated): allow frequent reads but cap abuse
    DATA_READ: { windowMs: 15 * 60 * 1000, maxRequests: 300, message: 'Too many read requests, please try again later' },
    // Public read: open endpoints need moderate limits
    PUBLIC: { windowMs: 15 * 60 * 1000, maxRequests: 200, message: 'Too many requests, please try again later' },
    // Debug/test: should barely be used in prod
    DEBUG: { windowMs: 15 * 60 * 1000, maxRequests: 5, message: 'Too many debug requests, please try again later' },
    // Export/report: heavy operations
    EXPORT: { windowMs: 15 * 60 * 1000, maxRequests: 10, message: 'Too many export requests, please try again later' },
    // Global fallback
    GLOBAL: { windowMs: 15 * 60 * 1000, maxRequests: 1000, message: 'Too many requests, please try again later' },
} as const;

class RateLimiter {
    private cache = new Map<string, RateLimitEntry>();
    private readonly config: RateLimitConfig;
    private cleanupInterval: NodeJS.Timeout;

    constructor(config: RateLimitConfig) {
        this.config = config;
        // Clean up expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    middleware = (req: Request, res: Response, next: NextFunction): void => {
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const now = Date.now();
        const key = `${ip}`;

        let entry = this.cache.get(key);

        if (!entry || now > entry.resetTime) {
            entry = {
                ip,
                count: 1,
                resetTime: now + this.config.windowMs
            };
            this.cache.set(key, entry);
        } else {
            entry.count++;

            if (entry.count > this.config.maxRequests) {
                res.status(429).json({
                    success: false,
                    message: this.config.message || 'Too many requests, please try again later',
                    error: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: Math.ceil((entry.resetTime - now) / 1000)
                });
                return;
            }
        }

        // Add rate limit headers
        res.set({
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, this.config.maxRequests - entry.count).toString(),
            'X-RateLimit-Reset': entry.resetTime.toString()
        });

        next();
    };

    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.resetTime) {
                this.cache.delete(key);
            }
        }
    }
}

// Factory function to create rate limiter middleware for a specific tier
export function createRateLimiter(config: RateLimitConfig) {
    const limiter = new RateLimiter(config);
    return limiter.middleware;
}

// Pre-built middleware for each tier
export const authRateLimit = createRateLimiter(RateLimitTiers.AUTH);
export const financialRateLimit = createRateLimiter(RateLimitTiers.FINANCIAL);
export const kycRateLimit = createRateLimiter(RateLimitTiers.KYC);
export const uploadRateLimit = createRateLimiter(RateLimitTiers.UPLOAD);
export const dataWriteRateLimit = createRateLimiter(RateLimitTiers.DATA_WRITE);
export const dataReadRateLimit = createRateLimiter(RateLimitTiers.DATA_READ);
export const publicRateLimit = createRateLimiter(RateLimitTiers.PUBLIC);
export const debugRateLimit = createRateLimiter(RateLimitTiers.DEBUG);
export const exportRateLimit = createRateLimiter(RateLimitTiers.EXPORT);

// Global rate limiter (backward compatible)
export const rateLimitMiddleware = createRateLimiter(RateLimitTiers.GLOBAL);
