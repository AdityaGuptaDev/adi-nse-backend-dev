import crypto from 'crypto';

const logger = console; // Replace with your logger if needed

const PADNG_TYPE = 'aes-128-cbc'; // AES-128 with CBC mode and PKCS7 padding
const ENCODE_TYPE = 'utf8';
const IV_LENGTH = 16; // AES block size is 16 bytes
const ALGORITHM = 'aes-128-cbc'; // Using AES-128-CBC

// Types for the encryption and decryption methods
interface EncryptionResult {
  encryptedText: string;
}

function encrypt(plainText: string | object | Buffer): string {
    let result = '';
    try {
      const secretKey = process.env.MFU_SECRET as string; // 16 bytes key
      const ivKey = process.env.MFU_IV as string; // 16 bytes IV
      
      // Ensure the key and IV are 16 bytes (128 bits)
      if (secretKey.length !== 16 || ivKey.length !== 16) {
        throw new Error("Secret key and IV must be 16 bytes (128 bits)");
      }
  
      const iv = Buffer.from(ivKey, ENCODE_TYPE); // Convert IV to a Buffer
      const key = Buffer.from(secretKey, ENCODE_TYPE); // Convert key to a Buffer
  
      logger.debug(`Secret Key len[${key.length}]`); // Debug log
      logger.debug(`IV Length [${iv.length}]`); // Debug log
  
      // Ensure plainText is a string or Buffer
      if (typeof plainText !== 'string' && !Buffer.isBuffer(plainText)) {
        // If plainText is an object, serialize it to a JSON string
        plainText = JSON.stringify(plainText);
      }
  
      // Convert plainText to Buffer
      const bufferPlainText = Buffer.isBuffer(plainText) ? plainText : Buffer.from(plainText, ENCODE_TYPE);
  
      // Create cipher instance
      const cipher = crypto.createCipheriv(PADNG_TYPE, key, iv);
  
      // Encrypt the plaintext
      let encrypted = cipher.update(bufferPlainText); // Encrypt and return as a Buffer
      encrypted = Buffer.concat([encrypted, cipher.final()]); // Finalize encryption
  
      // Convert encrypted Buffer to Base64 and make it URL-safe
      result = encrypted.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
      logger.error("Exception occurred while encrypting the text", e);
      throw new Error("General exception while encrypting the text.");
    }
    return result;
  }

function decrypt(cipherText: string): string {
  try {
    console.log("Cipher Text:", cipherText);

    const secretKey = process.env.MFU_SECRET as string; // 16 bytes key
    const ivKey = process.env.MFU_IV as string; // 16 bytes IV

    // Validate key and IV lengths
    if (Buffer.from(secretKey, ENCODE_TYPE).length !== 16) {
      throw new Error("Secret key must be 16 bytes (128 bits) for AES-128-CBC.");
    }
    if (Buffer.from(ivKey, ENCODE_TYPE).length !== IV_LENGTH) {
      throw new Error("IV must be 16 bytes (128 bits).");
    }

    const iv = Buffer.from(ivKey, ENCODE_TYPE);
    const key = Buffer.from(secretKey, ENCODE_TYPE);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(cipherText, 'base64', ENCODE_TYPE);
    decrypted += decipher.final(ENCODE_TYPE);

    return decrypted;
  } catch (error) {
    throw new Error("General exception while decrypting the text: " + error);
  }
}

export { encrypt, decrypt };
