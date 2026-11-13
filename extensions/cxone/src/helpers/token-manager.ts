/**
 * Token Manager - Handles encryption and decryption of CXone tokens
 */

import * as crypto from "crypto";

/**
 * Derives a 256-bit AES key from username and password
 */
function deriveKey(username: string, password: string): Buffer {
    const hash = crypto.createHash("sha256");
    hash.update(username + ":" + password);
    return hash.digest().subarray(0, 32);
}

/**
 * Token Manager class for encrypting and decrypting token data
 */
export class TokenManager {
    /**
     * Encrypt token data using AES-256-CBC
     */
    static encryptToken(token: string, username: string, password: string): string {
        const key = deriveKey(username, password);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
        let encrypted = cipher.update(token, "utf8", "base64");
        encrypted += cipher.final("base64");
        return iv.toString("base64") + ":" + encrypted;
    }

    /**
     * Decrypt token data using AES-256-CBC
     */
    static decryptToken(encryptedToken: string, username: string, password: string): string {
        const key = deriveKey(username, password);
        const [ivStr, enc] = encryptedToken.split(":");
        if (!ivStr || !enc) {
            throw new Error("Invalid encrypted token format");
        }
        const iv = Buffer.from(ivStr, "base64");
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        let decrypted = decipher.update(enc, "base64", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
}

