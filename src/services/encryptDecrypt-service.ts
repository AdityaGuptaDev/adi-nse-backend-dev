import configs from "../config/config";
import environment from "../environment";
const config = (configs as { [key: string]: any })[environment];
import crypto2 from "crypto";

// const crypto = require("crypto-js");
import cryptojs from "crypto-js";

const crypto = require('crypto');

// Import standardized encryption utility
import { standardDecrypt, standardEncrypt } from '../utils/standardEncryption';

/*variables for the mfu encryption and decryption */
const logger = console; // Replace with your logger if needed
const PADNG_TYPE = 'aes-128-cbc'; // AES-128 with CBC mode and PKCS7 padding
const ENCODE_TYPE = 'utf8';
const IV_LENGTH = 16; // AES block size is 16 bytes
const ALGORITHM = 'aes-128-cbc'; // Using AES-128-CBC
/*end of the section */


// Updated to use standardized encryption
export const encryptData = (data: any) => {
  return standardEncrypt(data);
};

// Updated to use standardized decryption
export const decryptData = (data: any) => {
  return standardDecrypt(data);
};


/*******aes 128 encryption and decryption for mfu********/

//encryption
export const mfuEncrypt = (data: any): string => {
  let result = '';
  try {
    const secretKey = config.mfuSecret || '';
    const ivKey = config.mfIv || '';

    // Ensure the key and IV are 16 bytes (128 bits)
    if (secretKey.length !== 16 || ivKey.length !== 16) {
      throw new Error('Secret key and IV must be 16 bytes (128 bits)');
    }

    const iv = Buffer.from(ivKey, ENCODE_TYPE);
    const key = Buffer.from(secretKey, ENCODE_TYPE);

    logger.debug(`Secret Key len[${key.length}]`);
    logger.debug(`IV Length [${iv.length}]`);

    let plainText: string;

    if (typeof data === 'string') {
      plainText = data;
    } else if (Buffer.isBuffer(data)) {
      plainText = data.toString(ENCODE_TYPE);
    } else {
      plainText = JSON.stringify(data);
    }

    logger.debug(`plainText type: ${typeof plainText}`);
    logger.debug(`plainText value: ${plainText}`);

    const cipher = crypto.createCipheriv(PADNG_TYPE, key, iv);

    let encrypted = cipher.update(plainText, ENCODE_TYPE, 'base64');
    encrypted += cipher.final('base64');

    // Convert to URL-safe Base64
    result = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    logger.error('Exception occurred while encrypting the text', e);
    throw new Error('General Exceptions while encrypting the text.');
  }

  return result;
}
//decryption
export const mfuDecrypt = (cipherText: string): string => {
  try {
    console.log("cipher Text:", cipherText);

    const secretKey = config.mfuSecret || '';
    const ivKey = config.mfIv || '';

    // Validate key and IV lengths
    if (Buffer.from(secretKey, ENCODE_TYPE).length !== 16) {
      throw new Error("Secret key must be 16 bytes (128 bits) for AES-128-CBC.");
    }
    if (Buffer.from(ivKey, ENCODE_TYPE).length !== IV_LENGTH) {
      throw new Error("IV must be 16 bytes (128 bits).");
    }

    const iv = Buffer.from(ivKey, ENCODE_TYPE);
    const key = Buffer.from(secretKey, ENCODE_TYPE);

    // Convert URL-safe base64 to standard base64
    const base64CipherText = cipherText
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(cipherText.length + (4 - (cipherText.length % 4)) % 4, '=');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(base64CipherText, 'base64', ENCODE_TYPE);
    decrypted += decipher.final(ENCODE_TYPE);

    return decrypted;
  } catch (error: any) {
    throw new Error("General exception while decrypting the text: " + error.message);
  }
};

/********end of mfu section *******/



// export const getEncryptedKYCData = (plaintext: any, AES_KEY: any) => {
//   // // Your 256-bit secret key (must be 32 bytes)
//   // const secretKey = Buffer.from(AES_KEY, 'base64url');

//   // // Generate a random IV (Initialization Vector)
//   // const iv = crypto.randomBytes(16);

//   // const ivForEncryption = Buffer.from(iv);

//   // // Create a cipher using AES-192-CBC with PKCS7 padding
//   // const cipher = crypto.createCipheriv('aes-192-cbc', secretKey, ivForEncryption);

//   // // Encrypt the plaintext
//   // let encrypted = cipher.update(plaintext, 'utf8', 'base64url');
//   // encrypted += cipher.final('base64url');

//   // console.log(encrypted, ivForEncryption.toString("base64url"), ">>>>>>>>>>>>>>")

//   // return {
//   //   encryptedData: encrypted,
//   //   iv: ivForEncryption.toString("base64url")
//   // }

//   // Decode base64 key
//   const key = crypto.enc.Base64.parse(AES_KEY);

//   // Generate random IV (16 bytes for AES)
//   const iv = crypto.lib.WordArray.random(16);

//   // Encrypt using AES with CBC mode and PKCS7 padding
//   const encrypted = crypto.AES.encrypt(plaintext, key, {
//     iv: iv,
//     mode: crypto.mode.CBC,
//     padding: crypto.pad.Pkcs7,
//   });

//   return {
//     encryptedData: encrypted.ciphertext.toString(crypto.enc.Base64),
//     iv: iv.toString(crypto.enc.Base64),
//   };
// }



export const getEncryptedKYCData = (plaintext: any, AES_KEY: any) => {
  // Your 256-bit secret key (must be 32 bytes)
  const secretKey = Buffer.from(AES_KEY, 'base64url');

  // Generate a random IV (Initialization Vector)
  const iv = crypto2.randomBytes(16);

  const ivForEncryption = Buffer.from(iv);

  // Create a cipher using AES-192-CBC with PKCS7 padding
  const cipher = crypto2.createCipheriv('aes-192-cbc', secretKey, ivForEncryption);

  // Encrypt the plaintext
  let encrypted = cipher.update(plaintext, 'utf8', 'base64url');
  encrypted += cipher.final('base64url');

  return {
    encryptedData: encrypted,
    iv: ivForEncryption.toString("base64url")
  }
}

/**
 * Generate encrypted link with expiry for photo capture
 * @param payload - The data to encrypt (investor_id, signzy_kyc_id, signzy_user_name)
 * @param expiryMinutes - Expiry time in minutes (default: 30 minutes)
 * @returns Encrypted token with expiry
 */
export const generateEncryptedLinkWithExpiry = (payload: any, expiryMinutes: number = 30) => {
  try {
    // Add expiry timestamp to payload
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);

    // Ultra-compact encoding: Pack investor_id and expiry into minimal bytes
    const buffer = Buffer.alloc(8); // 8 bytes total
    buffer.writeUInt32BE(payload.investor_id, 0); // 4 bytes for investor_id
    buffer.writeUInt32BE(Math.floor(expiryTime.getTime() / 1000), 4); // 4 bytes for expiry

    // Use minimal IV (8 bytes instead of 16)
    const iv = crypto2.randomBytes(8);
    const fullIv = Buffer.concat([iv, Buffer.alloc(8)]); // Pad to 16 bytes for AES

    // Use 16-byte key for AES-128
    const configKey = config.cryptoKey;
    let secretKey = Buffer.from(configKey, 'utf8');

    // Pad or truncate to exactly 16 bytes for AES-128
    if (secretKey.length < 16) {
      const paddedKey = Buffer.alloc(16);
      secretKey.copy(paddedKey);
      secretKey = paddedKey;
    } else if (secretKey.length > 16) {
      secretKey = secretKey.subarray(0, 16);
    }

    // Create cipher with AES-128
    const cipher = crypto2.createCipheriv('aes-128-cbc', secretKey, fullIv);

    // Encrypt the minimal data
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Combine minimal IV + encrypted data
    const combined = Buffer.concat([iv, encrypted]); // 8 bytes IV + encrypted data

    // Use base62 for maximum compactness (0-9, A-Z, a-z)
    const base62Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';

    // Convert entire buffer to a big integer and then to base62
    let num = BigInt('0x' + combined.toString('hex'));

    if (num === 0n) return '0';

    while (num > 0n) {
      result = base62Chars[Number(num % 62n)] + result;
      num = num / 62n;
    }

    return result;
  } catch (error) {
    logger.error('Error generating encrypted link with expiry:', error);
    throw new Error('Failed to generate encrypted link');
  }
};

/**
 * Decrypt and validate encrypted link token
 * @param token - The encrypted token to decrypt
 * @returns Decrypted payload if valid and not expired, null otherwise
 */
export const decryptAndValidateToken = (token: string) => {
  try {
    // Convert base62 token back to buffer
    const base62Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let num = 0n;

    for (const char of token) {
      const index = base62Chars.indexOf(char);
      if (index === -1) throw new Error('Invalid character in token');
      num = num * 62n + BigInt(index);
    }

    // Convert back to hex and then to buffer
    let hex = num.toString(16);
    if (hex.length % 2) hex = '0' + hex; // Ensure even length
    const combined = Buffer.from(hex, 'hex');

    // Extract IV (first 8 bytes) and encrypted data
    const shortIv = combined.subarray(0, 8);
    const encryptedData = combined.subarray(8);

    // Reconstruct full IV (pad to 16 bytes)
    const fullIv = Buffer.concat([shortIv, Buffer.alloc(8)]);

    // Use the same secret key with proper length handling for AES-128
    const configKey = config.cryptoKey;
    let secretKey = Buffer.from(configKey, 'utf8');

    // Pad or truncate to exactly 16 bytes for AES-128
    if (secretKey.length < 16) {
      const paddedKey = Buffer.alloc(16);
      secretKey.copy(paddedKey);
      secretKey = paddedKey;
    } else if (secretKey.length > 16) {
      secretKey = secretKey.subarray(0, 16);
    }

    // Create decipher
    const decipher = crypto2.createDecipheriv('aes-128-cbc', secretKey, fullIv);

    // Decrypt the data
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // Extract investor_id and expiry from the 8-byte buffer
    const investorId = decrypted.readUInt32BE(0);
    const expiryTimestamp = decrypted.readUInt32BE(4);

    // Check if token has expired (timestamps are in seconds)
    const now = Math.floor(new Date().getTime() / 1000);
    if (expiryTimestamp && now > expiryTimestamp) {
      return { valid: false, error: 'Token has expired', payload: null };
    }

    // Return the investor_id only (as requested)
    const payload = {
      investor_id: investorId
    };

    return {
      valid: true,
      payload: payload,
      expiresAt: new Date(expiryTimestamp * 1000), // Convert back to milliseconds
      generatedAt: null // Not stored in ultra-compact format
    };
  } catch (error) {
    logger.error('Error decrypting token:', error);
    return { valid: false, error: 'Invalid or corrupted token', payload: null };
  }
};

// Decryption function
// export const getDecryptedKYCData = (cipherText: any, AES_KEY: any) => {

//   console.log(cipherText, AES_KEY, ">>>>>>>>>>")
//   // const encryptedArray = cipherText.split(':');

//   // const iv = encryptedArray[0]
//   // const aeskey = Buffer.from(key, 'base64url');

//   // const ivForDecryption = Buffer.from(iv, 'base64url');

//   // const decipher = crypto.createDecipheriv('aes-192-cbc', aeskey, ivForDecryption);
//   // let decrypted = decipher.update(encryptedArray[1], 'base64url', 'utf8');
//   // decrypted += decipher.final('utf8');

//   // return {
//   //   decryptedData: JSON.parse(decrypted),
//   //   iv: iv
//   // }

//   const [base64urlIV, base64urlEncrypted] = cipherText.split(':');

//   // const encryptedArray = cipherText.split(':');


//   // Convert base64url to standard base64
//   const base64IV = base64urlToBase64(base64urlIV);
//   const base64Encrypted = base64urlToBase64(base64urlEncrypted);
//   const base64Key = base64urlToBase64(AES_KEY);

//   const key = crypto.enc.Base64.parse(base64Key);
//   const iv = crypto.enc.Base64.parse(base64IV);
//   const ciphertext = crypto.enc.Base64.parse(base64Encrypted);

//   const cipherParams = crypto.lib.CipherParams.create({
//     ciphertext: ciphertext
//   });

//   const decrypted = crypto.AES.decrypt(cipherParams, key, {
//     iv: iv,
//     mode: crypto.mode.CBC,
//     padding: crypto.pad.Pkcs7,
//   });

//   const utf8 = decrypted.toString(crypto.enc.Utf8);

//   if (!utf8) throw new Error('Decryption failed: Empty or invalid result');

//   console.log(JSON.parse(utf8), base64urlIV, ">>>>>>>>>>" )

//   return {
//     decryptedData: JSON.parse(utf8),
//     iv: base64urlIV,
//   };
// }

// export const getDecryptedKYCData = (cipherText: string, key: string) => {
//   console.log(cipherText,"cipherTextcipherText",key )

//   const [ivBase64url, encryptedBase64url] = cipherText.split(':');

//   // const encryptedArray = cipherText.split(':');
//   // const iv = encryptedArray[0];
//   // const encryptedData = encryptedArray[1];

//   if (!ivBase64url || !encryptedBase64url) {
//     throw new Error("Invalid cipherText format (missing IV or encrypted data)");
//   }
//   // Decode base64url (crypto only supports base64, so we convert manually)
//   const toBase64 = (val: string) => val.replace(/-/g, '+').replace(/_/g, '/');


//   const aesKey = crypto.enc.Utf8.parse(key);

//   const iv = crypto.enc.Base64.parse(toBase64(ivBase64url));
//   const ciphertext = crypto.enc.Base64.parse(toBase64(encryptedBase64url));

//   // Create CipherParams manually
//   const cipherParams = crypto.lib.CipherParams.create({
//     ciphertext: ciphertext
//   });

//   // Decrypt using AES
//   const decrypted = crypto.AES.decrypt(cipherParams, aesKey, {
//     iv,
//     mode: crypto.mode.CBC,
//     padding: crypto.pad.Pkcs7
//   });

//   console.log(decrypted,"decrypted")

//   const decryptedText = decrypted.toString(crypto.enc.Utf8);
//   console.log(decryptedText,"decryptedText")

//   return {
//     decryptedData: JSON.parse(decryptedText),
//     iv: ivBase64url
//   };
// };



export const getDecryptedKYCData = (cipherText: string, key: string) => {
  const [ivPart, encryptedPart] = cipherText.split(':');

  if (!ivPart || !encryptedPart) {
    throw new Error('Invalid cipherText format');
  }

  const iv = Buffer.from(ivPart.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const encryptedData = Buffer.from(encryptedPart.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const aesKey = Buffer.from(key.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

  if (aesKey.length !== 24) throw new Error('AES-192 requires a 24-byte key');
  if (iv.length !== 16) throw new Error('AES-CBC requires a 16-byte IV');

  try {
    const decipher = crypto2.createDecipheriv('aes-192-cbc', aesKey, iv);
    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return {
      decryptedData: JSON.parse(decrypted),
      iv: ivPart
    };
  } catch (err) {
    console.error("Decryption failed:", err);
    throw new Error('Decryption failed. Check your key, IV, and ciphertext.');
  }
};
