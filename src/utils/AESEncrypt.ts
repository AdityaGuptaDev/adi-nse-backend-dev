import crypto from "crypto";

export class CryptoUtils {


    static generateIV(): Buffer {
        return crypto.randomBytes(16);
    }

    static hexToBytes(hex: string): Buffer {
        return Buffer.from(hex, "hex");
    }
    private static base64ToBase64Url(base64Str: string): string {
        return base64Str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    private static base64UrlToBase64(base64UrlStr: string): string {
        return base64UrlStr.replace(/-/g, "+").replace(/_/g, "/");
    }

    static encryptString(aesKeyHex: string, data: string, iv: Buffer): string {
        const key = this.hexToBytes(aesKeyHex);
        if (![16, 24, 32].includes(key.length)) {
            throw new RangeError("Invalid AES key length. Must be 16, 24, or 32 bytes.");
        }

        const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
        let encrypted = cipher.update(data, "utf8", "base64");
        encrypted += cipher.final("base64");

        // Convert Base64 → Base64URL (same as Java)
        return this.base64ToBase64Url(encrypted);
    }

    // 🔹 Decrypt (for testing)
    static decryptString(aesKeyHex: string, encryptedBase64Url: string, iv: Buffer): string {
        const key = this.hexToBytes(aesKeyHex);
        const base64 = this.base64UrlToBase64(encryptedBase64Url);

        const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
        let decrypted = decipher.update(base64, "base64", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }

    /* const aesKey = "4c8c98585cfb425bb8ee3a003d535c8c"; // 16-byte AES key
 const data = "{'username':'WEBADMIN','poscode':'5100104974','password':'YkFwmz3FbD'}";
 
 const iv = EncryptionUtils.generateIV();
 const ivBase64Url = EncryptionUtils.base64ToBase64Url(iv.toString("base64"));
 const encryptedData = EncryptionUtils.encryptString(aesKey, data, iv);
 
 const encryptedRequestData = `${ivBase64Url}:${encryptedData}`;
 console.log("Encrypted Request Data:", encryptedRequestData);
 
 // ✅ Optional test decrypt
 const decryptedData = EncryptionUtils.decryptString(aesKey, encryptedData, iv);
 console.log("Decrypted:", decryptedData);*/
    /*static encryptString(aesKey: string, data: string): string {
        try {
            const generateIV = (): Buffer => crypto.randomBytes(16);

            const base64ToBase64Url = (base64Str: string): string =>
                base64Str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

            const keyBytes = Buffer.from(aesKey, "base64");
            const iv = generateIV();

            const cipher = crypto.createCipheriv("aes-256-cbc", keyBytes, iv);
            let encrypted = cipher.update(data, "utf8", "base64");
            encrypted += cipher.final("base64");

            const ivForPayload = base64ToBase64Url(iv.toString("base64"));
            const encryptedData = base64ToBase64Url(encrypted);

            return `${ivForPayload}:${encryptedData}`;
        } catch (error) {
            console.error("Encryption error:", error);
            throw error;
        }
    }*/

    /*static decryptString(aesKey: string, encryptedPayload: string): string {
        try {
            const base64UrlToBase64 = (base64UrlStr: string): string =>
                base64UrlStr.replace(/-/g, "+").replace(/_/g, "/");

            const [ivUrl, encryptedTextUrl] = encryptedPayload.split(":");

            const keyBytes = Buffer.from(aesKey, "base64");
            const ivBytes = Buffer.from(base64UrlToBase64(ivUrl), "base64");
            const encryptedBytes = Buffer.from(base64UrlToBase64(encryptedTextUrl), "base64");

            const decipher = crypto.createDecipheriv("aes-256-cbc", keyBytes, ivBytes);
            let decrypted = decipher.update(encryptedBytes, undefined, "utf8");
            decrypted += decipher.final("utf8");

            return decrypted;
        } catch (error) {
            console.error("Decryption error:", error);
            throw error;
        }
    }*/

    /*static demo() {
        const aesKey = Buffer.from("0000000000000000").toString("base64"); // 16-byte AES key
        const data = JSON.stringify({
            username: "WEBADMIN",
            poscode: "5100104974",
            password: "YkFwmz3FbD",
        });

        console.log("Original Data:", data);

        const encrypted = this.encryptString(aesKey, data);
        console.log("\nEncrypted Request Data:");
        console.log(encrypted);

        const decrypted = this.decryptString(aesKey, encrypted);
        console.log("\nDecrypted Response Data:");
        console.log(decrypted);
    }*/
}

