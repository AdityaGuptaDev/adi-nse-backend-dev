/**
 * Standardized Encryption/Decryption Utility
 * 
 * This utility provides consistent encryption/decryption across the entire application
 * with proper handling of URL-encoded characters and CryptoJS salted format.
 */

import CryptoJS from 'crypto-js';
import configs from '../config/config';
import environment from '../environment';

let config: any;
let CRYPTO_KEY: string;

try {
  config = (configs as { [key: string]: any })[environment];
  CRYPTO_KEY = config?.cryptoKey || 'va*proses';
} catch (error) {
  console.log('[StandardEncryption] Failed to load config, using fallback crypto key');
  CRYPTO_KEY = 'va*proses';
}

console.log('[StandardEncryption] Environment:', environment);
console.log('[StandardEncryption] Crypto key:', CRYPTO_KEY);

/**
 * Standardized decryption function that handles:
 * - CryptoJS salted format (U2FsdGVkX1 prefix)
 * - URL-encoded characters (#x2F, #x2B, #x3D, etc.)
 * - Regular AES encryption
 */
export const standardDecrypt = (cipher: string): string => {
  try {
    if (!cipher || typeof cipher !== 'string') {
      return cipher;
    }

    console.log('[StandardDecrypt] Original cipher:', cipher);
    
    // Handle URL-encoded characters in the cipher text
    // Common patterns: #x2F = /, #x2B = +, #x3D = =
    let cleanCipher = cipher;
    
    if (cipher.includes('#x2')) {
      console.log('[StandardDecrypt] Detected URL-encoded characters, decoding...');
      // Decode URL-encoded characters
      cleanCipher = cipher
        .replace(/#x2F/g, '/')   // Forward slash
        .replace(/#x2B/g, '+')   // Plus sign
        .replace(/#x3D/g, '=')   // Equals sign
        .replace(/#x2f/g, '/')   // Lowercase forward slash
        .replace(/#x2b/g, '+')   // Lowercase plus sign
        .replace(/#x3d/g, '=');  // Lowercase equals sign
      
      console.log('[StandardDecrypt] Cipher after URL decoding:', cleanCipher);
    }
    
    // Handle other malformed encrypted data patterns
    if (cleanCipher.includes('#') && !cleanCipher.includes('#x2')) {
      console.log('[StandardDecrypt] Detected malformed cipher, cleaning...');
      // Try to extract just the CryptoJS part before any special characters
      const parts = cleanCipher.split('#');
      if (parts[0].startsWith('U2FsdGVkX1')) {
        cleanCipher = parts[0];
      } else {
        // If it doesn't start with CryptoJS salt prefix, we can't decrypt it
        console.log('[StandardDecrypt] Invalid cipher format, returning as-is');
        return cipher;
      }
      console.log('[StandardDecrypt] Cipher after cleaning:', cleanCipher);
    }
    
    // Check if this is CryptoJS salted format (starts with 'U2FsdGVkX1' which is 'Salted__' in base64)
    if (cleanCipher.startsWith('U2FsdGVkX1')) {
      // This is CryptoJS salted format, decrypt it properly
      console.log('[StandardDecrypt] Using CryptoJS salted decryption...');
      const bytes = CryptoJS.AES.decrypt(cleanCipher, CRYPTO_KEY);
      const plain = bytes.toString(CryptoJS.enc.Utf8);
      if (!plain) throw new Error('Empty plaintext after decryption');
      console.log('[StandardDecrypt] Successfully decrypted:', plain);
      return plain;
    } else {
      // Try regular decryption for non-salted format
      console.log('[StandardDecrypt] Using regular AES decryption...');
      const bytes = CryptoJS.AES.decrypt(cleanCipher, CRYPTO_KEY);
      const plain = bytes.toString(CryptoJS.enc.Utf8);
      if (!plain) throw new Error('Empty plaintext after decryption');
      console.log('[StandardDecrypt] Successfully decrypted:', plain);
      return plain;
    }
  } catch (error: any) {
    // Return the original value unchanged so a malformed / already-plain field
    // doesn't break the request. Logs a warning for visibility.
    console.warn('[StandardDecrypt] Failed to decrypt — leaving as-is:', error.message);
    return cipher;
  }
};

/**
 * Standardized encryption function using CryptoJS
 */
export const standardEncrypt = (data: any): string => {
  try {
    const codedData = JSON.stringify(data);
    const ciphertext = CryptoJS.AES.encrypt(codedData, CRYPTO_KEY).toString();
    return ciphertext;
  } catch (error: any) {
    console.error('[StandardEncrypt] Encryption failed:', error.message);
    throw new Error('Encryption failed: ' + error.message);
  }
};

/**
 * PII field decryption with field validation
 */
export const decryptPIIField = (cipher: string, fieldName: string): string => {
  console.log(`[PII] Decrypting field ${fieldName}:`, cipher);
  const result = standardDecrypt(cipher);
  console.log(`[PII] Decryption result for ${fieldName}:`, result);
  if (result === cipher && cipher.includes('U2FsdGVkX1')) {
    console.warn(`[PII] Failed to decrypt ${fieldName} field`);
  }
  return result;
};

/**
 * Batch decryption for multiple PII fields
 */
export const decryptPIIFields = (obj: any, piiFields: Set<string>): any => {
  console.log('[PII] Starting batch PII decryption for object:', obj);
  
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => decryptPIIFields(item, piiFields));
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === '__pii_encrypted') {
      // Strip the sentinel – do not pass it to controllers
      console.log('[PII] Removing __pii_encrypted flag');
      continue;
    }

    if (piiFields.has(key) && typeof value === 'string' && value.trim() !== '') {
      console.log(`[PII] Processing PII field: ${key}`);
      result[key] = decryptPIIField(value, key);
    } else if (value && typeof value === 'object') {
      result[key] = decryptPIIFields(value, piiFields);
    } else {
      result[key] = value;
    }
  }

  console.log('[PII] Final decrypted object:', result);
  return result;
};

/**
 * URL encode special characters in encrypted data for safe transmission
 */
export const encodeForTransmission = (encryptedData: string): string => {
  return encryptedData
    .replace(/\//g, '#x2F')   // Forward slash
    .replace(/\+/g, '#x2B')   // Plus sign
    .replace(/=/g, '#x3D');  // Equals sign
};

/**
 * Decode URL-encoded characters from transmitted data
 */
export const decodeFromTransmission = (encodedData: string): string => {
  return encodedData
    .replace(/#x2F/g, '/')   // Forward slash
    .replace(/#x2B/g, '+')   // Plus sign
    .replace(/#x3D/g, '=')   // Equals sign
    .replace(/#x2f/g, '/')   // Lowercase forward slash
    .replace(/#x2b/g, '+')   // Lowercase plus sign
    .replace(/#x3d/g, '=');  // Lowercase equals sign
};

export default {
  standardDecrypt,
  standardEncrypt,
  decryptPIIField,
  decryptPIIFields,
  encodeForTransmission,
  decodeFromTransmission
};
