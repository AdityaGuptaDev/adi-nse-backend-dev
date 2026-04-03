import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
    ip: string;
    count: number;
    resetTime: number;
}

class RateLimiter {
    private static instance: RateLimiter;
    private cache = new Map<string, RateLimitEntry>();
    private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    private readonly MAX_REQUESTS = 1000; // requests per window

    static getInstance(): RateLimiter {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter();
        }
        return RateLimiter.instance;
    }

    checkLimit(req: Request, res: Response, next: NextFunction): void {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        const key = `${ip}`;

        let entry = this.cache.get(key);

        if (!entry || now > entry.resetTime) {
            // Create new entry or reset expired entry
            entry = {
                ip,
                count: 1,
                resetTime: now + this.WINDOW_MS
            };
            this.cache.set(key, entry);
        } else {
            // Increment count
            entry.count++;

            if (entry.count > this.MAX_REQUESTS) {
                res.status(429).json({
                    success: false,
                    message: 'Too many requests, please try again later',
                    error: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: Math.ceil((entry.resetTime - now) / 1000)
                });
                return;
            }
        }

        // Add rate limit headers
        res.set({
            'X-RateLimit-Limit': this.MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': Math.max(0, this.MAX_REQUESTS - entry.count).toString(),
            'X-RateLimit-Reset': entry.resetTime.toString()
        });

        next();
    }

    // Clean up expired entries periodically
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.resetTime) {
                this.cache.delete(key);
            }
        }
    }
}

export const rateLimiter = RateLimiter.getInstance();

// Middleware function
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    rateLimiter.checkLimit(req, res, next);
};

// Clean up expired entries every 5 minutes
setInterval(() => {
    rateLimiter.cleanup();
}, 5 * 60 * 1000);