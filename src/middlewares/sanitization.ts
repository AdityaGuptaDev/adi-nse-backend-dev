import { Request, Response, NextFunction } from 'express';

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
    // Sanitize query parameters
    if (req.query) {
        sanitizeObject(req.query);
    }

    // Sanitize body parameters
    if (req.body && typeof req.body === 'object') {
        sanitizeObject(req.body);
    }

    // Sanitize route parameters
    if (req.params) {
        sanitizeObject(req.params);
    }

    next();
};

// Recursive function to sanitize objects
function sanitizeObject(obj: any): void {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'string') {
                // Sanitize string values
                obj[key] = sanitizeString(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                // Recursively sanitize nested objects
                sanitizeObject(obj[key]);
            }
        }
    }
}

// String sanitization function
function sanitizeString(str: string): string {
    // Remove potential script tags and dangerous HTML
    let sanitized = str
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove potential SQL injection patterns (basic)
    sanitized = sanitized.replace(/('|(\\x27)|(\\x2D\\x2D)|(\\#)|(\\x23)|(;)|(\\x3B))/gi, '');

    // Remove potential command injection patterns
    sanitized = sanitized.replace(/(&|\||;|\$\(|\`)/g, '');

    return sanitized;
}

// Specific sanitization for different data types
export const sanitizeEmail = (email: string): string => {
    // Basic email sanitization - remove dangerous characters
    return email.replace(/[<>'"&]/g, '').toLowerCase().trim();
};

export const sanitizeMobile = (mobile: string): string => {
    // Remove all non-numeric characters
    return mobile.replace(/\D/g, '');
};

export const sanitizeName = (name: string): string => {
    // Allow only letters, spaces, hyphens, and apostrophes
    return name.replace(/[^a-zA-Z\s\-']/g, '').trim();
};

export const sanitizeAddress = (address: string): string => {
    // Basic sanitization for addresses - escape HTML and limit length
    return sanitizeString(address).substring(0, 500);
};

// Middleware for specific field sanitization
export const sanitizeUserInput = (req: Request, res: Response, next: NextFunction): void => {
    if (req.body) {
        // Sanitize user-specific fields
        if (req.body.mobileNo) {
            req.body.mobileNo = sanitizeMobile(req.body.mobileNo);
        }

        if (req.body.userName) {
            req.body.userName = sanitizeName(req.body.userName);
        }

        if (req.body.userGmail) {
            req.body.userGmail = sanitizeEmail(req.body.userGmail);
        }

        if (req.body.userAddress) {
            req.body.userAddress = sanitizeAddress(req.body.userAddress);
        }

        if (req.body.userState) {
            req.body.userState = sanitizeName(req.body.userState);
        }

        if (req.body.identifier) {
            req.body.identifier = sanitizeString(req.body.identifier);
        }

        if (req.body.pin) {
            req.body.pin = sanitizeString(req.body.pin);
        }
    }

    next();
};