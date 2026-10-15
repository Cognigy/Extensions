/// <reference types="jest" />

import { TokenManager } from "../token-manager";

describe("TokenManager", () => {
    const username = "testuser";
    const password = "testpass";
    const token = "test-token-12345";

    describe("encryptToken", () => {
        it("should produce valid format with iv:encrypted structure", () => {
            const encrypted = TokenManager.encryptToken(token, username, password);

            expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
            expect(encrypted.split(":")).toHaveLength(2);
        });

        it("should produce base64 encoded IV and encrypted data", () => {
            const encrypted = TokenManager.encryptToken(token, username, password);
            const [ivStr, encStr] = encrypted.split(":");

            // Both parts should be valid base64
            expect(() => Buffer.from(ivStr, "base64")).not.toThrow();
            expect(() => Buffer.from(encStr, "base64")).not.toThrow();

            // IV should be 16 bytes when decoded
            const iv = Buffer.from(ivStr, "base64");
            expect(iv.length).toBe(16);
        });

        it("should produce different encrypted values for same token due to random IV", () => {
            const encrypted1 = TokenManager.encryptToken(token, username, password);
            const encrypted2 = TokenManager.encryptToken(token, username, password);

            // Should be different due to random IV
            expect(encrypted1).not.toBe(encrypted2);

            // But both should have valid format
            expect(encrypted1).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
            expect(encrypted2).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
        });

        it("should handle empty token", () => {
            const encrypted = TokenManager.encryptToken("", username, password);

            expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]*$/);
        });

        it("should handle long token strings", () => {
            const longToken = "a".repeat(10000);
            const encrypted = TokenManager.encryptToken(longToken, username, password);

            expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
        });

        it("should handle special characters in token", () => {
            const specialToken = "token!@#$%^&*()_+-=[]{}|;':\",./<>?`~";
            const encrypted = TokenManager.encryptToken(specialToken, username, password);

            expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
        });

        it("should handle unicode characters in token", () => {
            const unicodeToken = "token-测试-🚀-café";
            const encrypted = TokenManager.encryptToken(unicodeToken, username, password);

            expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
        });

        it("should produce different encrypted values for different credentials", () => {
            const encrypted1 = TokenManager.encryptToken(token, "user1", "pass1");
            const encrypted2 = TokenManager.encryptToken(token, "user2", "pass2");

            expect(encrypted1).not.toBe(encrypted2);
        });
    });

    describe("decryptToken", () => {
        it("should correctly decrypt encrypted tokens (round-trip)", () => {
            const encrypted = TokenManager.encryptToken(token, username, password);
            const decrypted = TokenManager.decryptToken(encrypted, username, password);

            expect(decrypted).toBe(token);
        });

        it("should return original token value after encrypt-then-decrypt", () => {
            const testTokens = [
                "simple-token",
                "token-with-special-chars!@#$%",
                "token-with-unicode-测试-🚀",
                "a".repeat(1000),
                ""
            ];

            testTokens.forEach((testToken) => {
                const encrypted = TokenManager.encryptToken(testToken, username, password);
                const decrypted = TokenManager.decryptToken(encrypted, username, password);

                expect(decrypted).toBe(testToken);
            });
        });

        it("should throw error for invalid format - missing colon", () => {
            const invalidToken = "no-colon-here";

            expect(() => {
                TokenManager.decryptToken(invalidToken, username, password);
            }).toThrow("Invalid encrypted token format");
        });

        it("should throw error for invalid format - empty string", () => {
            expect(() => {
                TokenManager.decryptToken("", username, password);
            }).toThrow("Invalid encrypted token format");
        });

        it("should throw error for invalid format - only IV part", () => {
            const encrypted = TokenManager.encryptToken(token, username, password);
            const [ivStr] = encrypted.split(":");

            expect(() => {
                TokenManager.decryptToken(ivStr, username, password);
            }).toThrow("Invalid encrypted token format");
        });

        it("should throw error for invalid format - only encrypted part", () => {
            const encrypted = TokenManager.encryptToken(token, username, password);
            const [, encStr] = encrypted.split(":");

            expect(() => {
                TokenManager.decryptToken(`:${encStr}`, username, password);
            }).toThrow("Invalid encrypted token format");
        });

        it("should throw error for invalid base64 in IV", () => {
            const encrypted = TokenManager.encryptToken(token, username, password);
            const [, encStr] = encrypted.split(":");

            expect(() => {
                TokenManager.decryptToken(`invalid-base64:${encStr}`, username, password);
            }).toThrow();
        });

        it("should throw error for invalid base64 in encrypted data", () => {
            const encrypted = TokenManager.encryptToken(token, username, password);
            const [ivStr] = encrypted.split(":");

            expect(() => {
                TokenManager.decryptToken(`${ivStr}:invalid-base64`, username, password);
            }).toThrow();
        });

        it("should not decrypt with wrong credentials", () => {
            const encrypted = TokenManager.encryptToken(token, username, password);

            expect(() => {
                TokenManager.decryptToken(encrypted, "wronguser", "wrongpass");
            }).toThrow();
        });

        it("should not decrypt with wrong username", () => {
            const encrypted = TokenManager.encryptToken(token, username, password);

            expect(() => {
                TokenManager.decryptToken(encrypted, "wronguser", password);
            }).toThrow();
        });

        it("should not decrypt with wrong password", () => {
            const encrypted = TokenManager.encryptToken(token, username, password);

            expect(() => {
                TokenManager.decryptToken(encrypted, username, "wrongpass");
            }).toThrow();
        });
    });

    describe("Integration tests", () => {
        it("should handle multiple encrypt/decrypt cycles correctly", () => {
            const tokens = ["token1", "token2", "token3"];

            tokens.forEach((testToken) => {
                for (let i = 0; i < 5; i++) {
                    const encrypted = TokenManager.encryptToken(testToken, username, password);
                    const decrypted = TokenManager.decryptToken(encrypted, username, password);

                    expect(decrypted).toBe(testToken);
                }
            });
        });

        it("should encrypt/decrypt different tokens with same credentials independently", () => {
            const token1 = "token-one";
            const token2 = "token-two";
            const token3 = "token-three";

            const encrypted1 = TokenManager.encryptToken(token1, username, password);
            const encrypted2 = TokenManager.encryptToken(token2, username, password);
            const encrypted3 = TokenManager.encryptToken(token3, username, password);

            expect(TokenManager.decryptToken(encrypted1, username, password)).toBe(token1);
            expect(TokenManager.decryptToken(encrypted2, username, password)).toBe(token2);
            expect(TokenManager.decryptToken(encrypted3, username, password)).toBe(token3);
        });

        it("should handle same token encrypted multiple times with same credentials", () => {
            const encrypted1 = TokenManager.encryptToken(token, username, password);
            const encrypted2 = TokenManager.encryptToken(token, username, password);
            const encrypted3 = TokenManager.encryptToken(token, username, password);

            // All should decrypt to the same original token
            expect(TokenManager.decryptToken(encrypted1, username, password)).toBe(token);
            expect(TokenManager.decryptToken(encrypted2, username, password)).toBe(token);
            expect(TokenManager.decryptToken(encrypted3, username, password)).toBe(token);

            // But encrypted values should be different due to random IV
            expect(encrypted1).not.toBe(encrypted2);
            expect(encrypted2).not.toBe(encrypted3);
            expect(encrypted1).not.toBe(encrypted3);
        });
    });
});

