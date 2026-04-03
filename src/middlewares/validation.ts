import { Request, Response, NextFunction } from 'express';
/*import { UserCreateRequest, UserLoginRequest, AvailabilityCheckRequest, UserLocationCreateRequest, UserLocationUpdateRequest } from '../types';

export const validateUserCreate = (req: Request, res: Response, next: NextFunction): void => {
    const { mobileNo, userName, userPass, userGmail, userAddress, userState, deviceId, deviceModel } = req.body;

    const errors: string[] = [];

    if (!mobileNo || mobileNo.trim().length < 10) {
        errors.push('Valid mobile number is required');
    }

    if (!userName || userName.trim().length < 2) {
        errors.push('User name must be at least 2 characters long');
    }

    if (!userPass || userPass.length < 4) {
        errors.push('Password must be at least 4 characters long');
    }

    if (userGmail && !isValidEmail(userGmail)) {
        errors.push('Valid email address is required');
    }

    if (!userAddress || userAddress.trim().length < 5) {
        errors.push('Valid address is required');
    }

    if (!userState || userState.trim().length < 2) {
        errors.push('Valid state is required');
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
        return;
    }

    next();
};

export const validateUserLogin = (req: Request, res: Response, next: NextFunction): void => {
    const { identifier, pin, deviceId, deviceModel } = req.body;

    const errors: string[] = [];

    if (!identifier || identifier.trim().length === 0) {
        errors.push('Mobile number or email is required');
    }

    if (!pin || pin.length < 4) {
        errors.push('PIN must be at least 4 characters long');
    }

    
    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
        return;
    }

    next();
};

export const validateAvailabilityCheck = (req: Request, res: Response, next: NextFunction): void => {
    const { mobileNo, email } = req.body;

    if (!mobileNo && !email) {
        res.status(400).json({
            success: false,
            message: 'Either mobile number or email is required',
            errors: ['At least one identifier is required']
        });
        return;
    }

    if (mobileNo && mobileNo.trim().length < 10) {
        res.status(400).json({
            success: false,
            message: 'Valid mobile number is required',
            errors: ['Mobile number must be at least 10 digits']
        });
        return;
    }

    if (email && !isValidEmail(email)) {
        res.status(400).json({
            success: false,
            message: 'Valid email address is required',
            errors: ['Email format is invalid']
        });
        return;
    }

    next();
};

export const validateUserId = (req: Request, res: Response, next: NextFunction): void => {
    const { userId } = req.params;
    console.log('Validating userId:', userId);

    if (!userId || userId.trim().length === 0) {
        res.status(400).json({
            success: false,
            message: 'User ID is required',
            errors: ['Valid user ID is required']
        });
        return;
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
        res.status(400).json({
            success: false,
            message: 'Invalid user ID format',
            errors: ['User ID must be a valid UUID']
        });
        return;
    }

    next();
};

export const validateTransaction = (req: Request, res: Response, next: NextFunction): void => {
    const { type, amount, description } = req.body;
    console.log(req.body)

    const errors: string[] = [];

   

    if (!description || description.trim().length === 0) {
        errors.push('Transaction description is required');
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
        return;
    }

    next();
};

// Helper function to validate email format
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// User Profile validation functions
export const validateUserProfileCreate = (req: Request, res: Response, next: NextFunction): void => {
    const { userId } = req.body;

    const errors: string[] = [];

    if (!userId || userId.trim().length === 0) {
        errors.push('User ID is required');
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
        return;
    }

    next();
};

export const validateUserProfileUpdate = (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body;

    // Allow empty updates for flexibility
    if (Object.keys(body).length === 0) {
        res.status(400).json({
            success: false,
            message: 'At least one field must be provided for update',
            errors: ['No fields to update']
        });
        return;
    }

    next();
};

// Camera Security validation functions
export const validateCameraSecurityCreate = (req: Request, res: Response, next: NextFunction): void => {
    const { type, latitude, longitude } = req.body;

    const errors: string[] = [];

    if (!type || type.trim().length === 0) {
        errors.push('Type is required');
    }

    if (latitude !== undefined && (latitude === null || isNaN(Number(latitude)))) {
        errors.push('Valid latitude is required');
    } else if (latitude !== undefined) {
        const lat = Number(latitude);
        if (lat < -90 || lat > 90) {
            errors.push('Latitude must be between -90 and 90');
        }
    }

    if (longitude !== undefined && (longitude === null || isNaN(Number(longitude)))) {
        errors.push('Valid longitude is required');
    } else if (longitude !== undefined) {
        const lng = Number(longitude);
        if (lng < -180 || lng > 180) {
            errors.push('Longitude must be between -180 and 180');
        }
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
        return;
    }

    next();
};

export const validateCameraSecurityUpdate = (req: Request, res: Response, next: NextFunction): void => {
    const { latitude, longitude } = req.body;

    const errors: string[] = [];

    if (latitude !== undefined && (latitude === null || isNaN(Number(latitude)))) {
        errors.push('Valid latitude is required');
    } else if (latitude !== undefined) {
        const lat = Number(latitude);
        if (lat < -90 || lat > 90) {
            errors.push('Latitude must be between -90 and 90');
        }
    }

    if (longitude !== undefined && (longitude === null || isNaN(Number(longitude)))) {
        errors.push('Valid longitude is required');
    } else if (longitude !== undefined) {
        const lng = Number(longitude);
        if (lng < -180 || lng > 180) {
            errors.push('Longitude must be between -180 and 180');
        }
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
        return;
    }

    next();
};

// Location validation functions
export const validateLocationCreate = (req: Request, res: Response, next: NextFunction): void => {
    const { documentId, locationDate, latitude, longitude } = req.body;

    const errors: string[] = [];

    if (!documentId || documentId.trim().length === 0) {
        errors.push('Document ID is required');
    }

    if (!locationDate || locationDate.trim().length === 0) {
        errors.push('Location date is required');
    }

    if (latitude === undefined || latitude === null || isNaN(Number(latitude))) {
        errors.push('Valid latitude is required');
    } else {
        const lat = Number(latitude);
        if (lat < -90 || lat > 90) {
            errors.push('Latitude must be between -90 and 90');
        }
    }

    if (longitude === undefined || longitude === null || isNaN(Number(longitude))) {
        errors.push('Valid longitude is required');
    } else {
        const lng = Number(longitude);
        if (lng < -180 || lng > 180) {
            errors.push('Longitude must be between -180 and 180');
        }
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
        return;
    }

    next();
};

export const validateLocationUpdate = (req: Request, res: Response, next: NextFunction): void => {
    const { latitude, longitude } = req.body;

    const errors: string[] = [];

    if (latitude !== undefined && (latitude === null || isNaN(Number(latitude)))) {
        errors.push('Valid latitude is required');
    } else if (latitude !== undefined) {
        const lat = Number(latitude);
        if (lat < -90 || lat > 90) {
            errors.push('Latitude must be between -90 and 90');
        }
    }

    if (longitude !== undefined && (longitude === null || isNaN(Number(longitude)))) {
        errors.push('Valid longitude is required');
    } else if (longitude !== undefined) {
        const lng = Number(longitude);
        if (lng < -180 || lng > 180) {
            errors.push('Longitude must be between -180 and 180');
        }
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
        return;
    }

    next();
};

// Helper function to validate mobile number format (Indian format)
function isValidMobileNumber(mobile: string): boolean {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
}*/