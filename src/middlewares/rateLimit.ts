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

// --- Auth failure-based rate limiter ---
// Only counts FAILED login/OTP attempts, not successful ones
interface AuthFailureEntry {
    count: number;
    resetTime: number;
}

class AuthFailureRateLimiter {
    private static instance: AuthFailureRateLimiter;
    private cache = new Map<string, AuthFailureEntry>();
    private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    private readonly MAX_FAILURES = 5; // max failed attempts before blocking

    constructor() {
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    static getInstance(): AuthFailureRateLimiter {
        if (!AuthFailureRateLimiter.instance) {
            AuthFailureRateLimiter.instance = new AuthFailureRateLimiter();
        }
        return AuthFailureRateLimiter.instance;
    }

    // Middleware: check if IP is blocked BEFORE allowing the request through
    middleware = (req: Request, res: Response, next: NextFunction): void => {
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const now = Date.now();
        const entry = this.cache.get(ip);

        // No entry or expired → allow
        if (!entry || now > entry.resetTime) {
            return next();
        }

        // Under the limit → allow
        if (entry.count < this.MAX_FAILURES) {
            return next();
        }

        // Blocked - too many failures
        res.status(429).json({
            success: false,
            message: 'Too many failed attempts, please try again later',
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        });
    };

    // Call this when login/OTP FAILS
    recordFailure(req: Request): void {
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        const now = Date.now();
        let entry = this.cache.get(ip);

        if (!entry || now > entry.resetTime) {
            entry = { count: 1, resetTime: now + this.WINDOW_MS };
        } else {
            entry.count++;
        }

        this.cache.set(ip, entry);
    }

    // Call this when login/OTP SUCCEEDS → clear their failures
    clearFailures(req: Request): void {
        const ip = req.ip || req.socket?.remoteAddress || 'unknown';
        this.cache.delete(ip);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.resetTime) {
                this.cache.delete(key);
            }
        }
    }
}

export const authFailureLimiter = AuthFailureRateLimiter.getInstance();
// Middleware to check if blocked
export const authRateLimit = authFailureLimiter.middleware;

// Pre-defined rate limit tiers
export const RateLimitTiers = {
    // Financial transactions: strict - prevent abuse of money movement
    FINANCIAL: { windowMs: 15 * 60 * 1000, maxRequests: 30, message: 'Too many transaction requests, please try again later' },
    // KYC & verification: moderate - external API cost + abuse prevention.
    // A single full onboarding does ~15 verification calls (mobile OTP
    // send+verify, PAN, Aadhaar send+verify, bank, email send+verify, nominee
    // updates); 20 left no headroom for a retry. 60 still blocks abuse.
    KYC: { windowMs: 15 * 60 * 1000, maxRequests: 60, message: 'Too many verification requests, please try again later' },
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
        // Prefer the auth token when present so two authenticated users behind
        // the same NAT/proxy each get their own budget; fall back to IP for
        // anonymous requests.
        const authToken = req.headers.authorization?.split(' ')[1];
        const now = Date.now();
        const key = authToken ? `token:${authToken}` : `ip:${ip}`;

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

// ─── Recipient-keyed limiter (OTP-send protection) ─────────────────────────
// OTP-send endpoints need an ADDITIONAL layer keyed by the OTP recipient
// (mobile/email/aadhaar). Without this, a single authenticated session can
// hammer an arbitrary mobile number with OTP SMS — turning our backend into an
// SMS bomb relay. This is a separate bucket from the token/IP-based limiter.
type KeyExtractor = (req: Request) => string | null | undefined;

export function createRecipientRateLimiter(config: RateLimitConfig, keyExtractor: KeyExtractor) {
    const cache = new Map<string, RateLimitEntry>();
    setInterval(() => {
        const now = Date.now();
        for (const [k, v] of cache.entries()) {
            if (now > v.resetTime) cache.delete(k);
        }
    }, 5 * 60 * 1000);

    return (req: Request, res: Response, next: NextFunction): void => {
        const recipient = keyExtractor(req);
        // If we can't extract a recipient, let the request through — the main
        // KYC rate limiter (applied alongside this one) still provides coverage.
        if (!recipient) return next();

        const now = Date.now();
        const key = `recipient:${recipient}`;
        let entry = cache.get(key);

        if (!entry || now > entry.resetTime) {
            cache.set(key, { ip: recipient, count: 1, resetTime: now + config.windowMs });
            return next();
        }

        entry.count++;
        if (entry.count > config.maxRequests) {
            res.status(429).json({
                success: false,
                message: config.message || 'Too many OTP requests for this recipient, please try again later',
                error: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil((entry.resetTime - now) / 1000),
            });
            return;
        }

        next();
    };
}

// 5 OTP sends per 15 min per mobile number. Prevents a single session (or a
// leaked token) from spamming a target phone with SMS OTPs.
export const mobileOtpSendLimit = createRecipientRateLimiter(
    { windowMs: 15 * 60 * 1000, maxRequests: 5,
      message: 'Too many OTP requests for this mobile number, please try again later' },
    (req) => (req.body?.mobile || req.body?.mobile_no || req.body?.phone || '').toString().trim() || null,
);

// 5 email OTP sends per 15 min per email address.
export const emailOtpSendLimit = createRecipientRateLimiter(
    { windowMs: 15 * 60 * 1000, maxRequests: 5,
      message: 'Too many OTP requests for this email address, please try again later' },
    (req) => (req.body?.email || '').toString().trim().toLowerCase() || null,
);

// 5 Aadhaar OTP sends per 15 min per Aadhaar number.
export const aadhaarOtpSendLimit = createRecipientRateLimiter(
    { windowMs: 15 * 60 * 1000, maxRequests: 5,
      message: 'Too many OTP requests for this Aadhaar, please try again later' },
    (req) => (req.body?.aadhaar || req.body?.adhaar || '').toString().trim() || null,
);
