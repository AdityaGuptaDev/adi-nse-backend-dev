/**
 * PII Decrypt Middleware
 *
 * The frontend `piiEncrypt.ts` utility encrypts sensitive fields (mobile, PAN,
 * Aadhaar, email, password, etc.) with AES before every API call and injects
 * `__pii_encrypted: true` into the request body.
 *
 * This middleware detects that flag, walks the body recursively, and decrypts
 * every known PII field back to plaintext before the request reaches any
 * controller. Controllers therefore need zero changes.
 *
 * Encryption algorithm: CryptoJS.AES (AES-256-CBC with random IV, OpenSSL
 * format) — identical to the `encryptData` / `decryptData` functions in
 * `encryptDecrypt-service.ts`.
 *
 * Register in `app.ts` AFTER bodyParser and BEFORE routes:
 *   import { piiDecryptMiddleware } from './middlewares/piiDecrypt.middleware';
 *   app.use(piiDecryptMiddleware);
 */

import { Request, Response, NextFunction } from 'express';
import { decryptPIIFields, standardDecrypt } from '../utils/standardEncryption';
import CryptoJS from 'crypto-js';
import configs from '../config/config';
import environment from '../environment';

console.log('[piiDecrypt] Middleware loaded with standardized utility');

const config = (configs as { [key: string]: any })[environment];
const CRYPTO_KEY = config.cryptoKey || 'va*proses';

// Temporary direct decryption function as backup
const tempDecrypt = (cipher: string): string => {
  try {
    if (!cipher || typeof cipher !== 'string') {
      return cipher;
    }

    console.log('[TempDecrypt] Original cipher:', cipher);
    
    // Handle URL-encoded characters
    let cleanCipher = cipher;
    if (cipher.includes('#x2')) {
      console.log('[TempDecrypt] Detected URL-encoded characters, decoding...');
      cleanCipher = cipher
        .replace(/#x2F/g, '/')   // Forward slash
        .replace(/#x2B/g, '+')   // Plus sign
        .replace(/#x3D/g, '=')   // Equals sign
        .replace(/#x2f/g, '/')   // Lowercase forward slash
        .replace(/#x2b/g, '+')   // Lowercase plus sign
        .replace(/#x3d/g, '=');  // Lowercase equals sign
      
      console.log('[TempDecrypt] Cipher after URL decoding:', cleanCipher);
    }
    
    // Better encryption format detection and decryption
    const decrypted = tryMultipleDecryptionMethods(cleanCipher);
    return decrypted;
  } catch (error: any) {
    console.warn('[TempDecrypt] Failed to decrypt — leaving as-is:', error.message);
    return cipher;
  }
};

// Better implementation: Try multiple decryption methods
const tryMultipleDecryptionMethods = (cipher: string): string => {
  console.log('[TempDecrypt] Analyzing cipher format...');
  
  // Method 1: Try CryptoJS salted format detection
  if (isCryptoJSSaltedFormat(cipher)) {
    console.log('[TempDecrypt] Detected CryptoJS salted format, decrypting...');
    return decryptWithCryptoJS(cipher);
  }
  
  // Method 2: Try regular AES format
  console.log('[TempDecrypt] Trying regular AES decryption...');
  return decryptWithRegularAES(cipher);
};

// Better CryptoJS salted format detection
const isCryptoJSSaltedFormat = (cipher: string): boolean => {
  // CryptoJS salted format starts with 'Salted__' in base64, which is 'U2FsdGVkX1'
  // But we should be more flexible and handle variations
  const saltedPrefixes = [
    'U2FsdGVkX1',  // Standard CryptoJS salted format
    'U2FsdGVk',    // Some variations
    'Salted__'     // Direct string (unlikely but possible)
  ];
  
  return saltedPrefixes.some(prefix => cipher.startsWith(prefix));
};

// CryptoJS decryption method
const decryptWithCryptoJS = (cipher: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, CRYPTO_KEY);
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    if (!plain) throw new Error('Empty plaintext after CryptoJS decryption');
    console.log('[TempDecrypt] CryptoJS decryption successful:', plain);
    return plain;
  } catch (error: any) {
    console.log('[TempDecrypt] CryptoJS decryption failed:', error.message);
    throw error;
  }
};

// Regular AES decryption method
const decryptWithRegularAES = (cipher: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, CRYPTO_KEY);
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    if (!plain) throw new Error('Empty plaintext after regular AES decryption');
    console.log('[TempDecrypt] Regular AES decryption successful:', plain);
    return plain;
  } catch (error: any) {
    console.log('[TempDecrypt] Regular AES decryption failed:', error.message);
    throw error;
  }
};

// ─── Field names that carry PII ──────────────────────────────────────────────
const PII_FIELDS = new Set([
  'mobile',
  'mobile_number',
  'mobile_no',
  'phone',
  'phone_number',
  'pan_no',
  'pan',
  'aadhaar',
  'aadhaar_no',
  'aadhaar_number',
  'aadhar',
  'aadhar_no',
  'aadhar_number',
  'email',
  'email_address',
  'email_id',
  'userName',
  'username',
  'account_number',
  'bank_account_number',
  'accountNumber',
  'ifsc',
  'ifsc_code',
  'dob',
  'date_of_birth',
  'password',
]);

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Recursively walk a value. For objects — strip `__pii_encrypted` sentinels,
 * decrypt every value whose key is in PII_FIELDS, and descend into any nested
 * object/array so deeply-nested PII (e.g. `transaction.paySec.ifsc`) also gets
 * decrypted. For arrays — apply the same to each element.
 *
 * This is critical for proxied payloads (MFU, NSE, etc.) where PII lives at
 * arbitrary depths like `transaction.paySec.ifsc`,
 * `transaction.subSeqSec.accNo`, `transaction.logDtl.custIpAddress`. A shallow
 * walk leaves those ciphertext strings untouched and upstream providers reject
 * the request with generic errors like "Invalid Request Details".
 */
const walkAndDecrypt = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map((item) => walkAndDecrypt(item));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const [key, child] of Object.entries(value)) {
      if (key === '__pii_encrypted') continue; // strip sentinels at every level
      if (PII_FIELDS.has(key) && typeof child === 'string' && child.trim() !== '') {
        result[key] = tempDecrypt(child);
      } else {
        result[key] = walkAndDecrypt(child);
      }
    }
    return result;
  }

  return value;
};

export const piiDecryptMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    console.log('[piiDecrypt] === MIDDLEWARE EXECUTING ===');
    console.log('[piiDecrypt] Request body:', JSON.stringify(req.body, null, 2));

    // Only process JSON bodies that carry the PII-encrypted flag — either at
    // the top level OR anywhere nested (our recursive walker handles both).
    const hasFlag = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object') return false;
      if (obj.__pii_encrypted === true) return true;
      if (Array.isArray(obj)) return obj.some(hasFlag);
      return Object.values(obj).some(hasFlag);
    };

    if (req.body && typeof req.body === 'object' && hasFlag(req.body)) {
      console.log('[piiDecrypt] PII encryption detected, decrypting recursively...');
      req.body = walkAndDecrypt(req.body);
      console.log('[piiDecrypt] Final decrypted body:', JSON.stringify(req.body, null, 2));
      console.log('[piiDecrypt] === MIDDLEWARE COMPLETED ===');
    } else {
      console.log('[piiDecrypt] No PII encryption flag found, proceeding with original body');
    }
  } catch (err: any) {
    // Never block a request due to decryption failure – log and continue.
    console.error('[piiDecrypt] Unexpected error during PII decryption:', err);
    console.error('[piiDecrypt] Error details:', err?.message || err);
  }

  next();
};
