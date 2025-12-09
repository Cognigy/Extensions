/**
 * CXone API Client - Centralized API communication
 */

import * as jwt from "jsonwebtoken";
import {
    CognigyApi,
    CognigyContext,
    CXoneConnection,
    CXoneTokenResponse,
    CXoneOpenIdConfigResponse,
    CXoneConfigResponse,
    DecodedJWTToken,
    HandoverAction
} from "../types";
import { TokenManager } from "../helpers/token-manager";
import { TOKEN_CACHE_TTL_MINUTES, CXONE_API_VERSION } from "../config";

/**
 * CXone API Client class
 */
export class CXoneApiClient {
    constructor(
        private api: CognigyApi,
        private context: CognigyContext,
        private connection: CXoneConnection
    ) {}

    /**
     * Get bearer token, using cache if available and fresh
     */
    async getToken(): Promise<CXoneTokenResponse> {
        const cachedData = this.context.cxoneEncryptedToken;
        const cachedTime = this.context.cxoneTokenTimestamp;

        // Check if token exists and is fresh
        if (cachedData && cachedTime) {
            const ageMinutes = (Date.now() - cachedTime) / (1000 * 60);
            if (ageMinutes < TOKEN_CACHE_TTL_MINUTES) {
                try {
                    const token = TokenManager.decryptToken(
                        cachedData,
                        this.connection.accessKeyId,
                        this.connection.accessKeySecret
                    );
                    if (this.api.log) {
                        this.api.log(
                            "info",
                            `CXone API Client: Using cached token, age: ${Math.floor(ageMinutes)} min`
                        );
                    }
                    return JSON.parse(token);
                } catch (err) {
                    if (this.api.log) {
                        this.api.log(
                            "warn",
                            "CXone API Client: Failed to decrypt cached token, requesting new one"
                        );
                    }
                }
            } else {
                if (this.api.log) {
                    this.api.log(
                        "info",
                        `CXone API Client: Cached token expired (older than ${TOKEN_CACHE_TTL_MINUTES} min), refreshing...`
                    );
                }
            }
        }

        // Request new token
        const tokenUrl = await this.getOpenIdConfig();
        const basicToken = Buffer.from(
            `${this.connection.clientId}:${this.connection.clientSecret}`
        ).toString("base64");

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + basicToken
        };

        const body = new URLSearchParams({
            grant_type: "password",
            username: this.connection.accessKeyId,
            password: this.connection.accessKeySecret
        });

        const response = await fetch(tokenUrl, { method: "POST", headers, body });

        if (!response.ok) {
            throw new Error(
                `CXone API Client: Error getting bearer token: ${response.status}: ${response.statusText}`
            );
        }

        const data: CXoneTokenResponse = await response.json();

        // Encrypt and store in context
        const encrypted = TokenManager.encryptToken(
            JSON.stringify(data),
            this.connection.accessKeyId,
            this.connection.accessKeySecret
        );
        if (this.api.addToContext) {
            this.api.addToContext("cxoneEncryptedToken", encrypted, "simple");
            this.api.addToContext("cxoneTokenTimestamp", Date.now(), "simple");
        }
        if (this.api.log) {
            this.api.log("info", "CXone API Client: Cached new encrypted token in context");
        }

        return data;
    }

    /**
     * Get OpenID configuration endpoint URL (with caching)
     */
    async getOpenIdConfig(): Promise<string> {
        const cachedTokenUrl = this.context.cxoneTokenUrl;
        if (cachedTokenUrl) {
            if (this.api.log) {
                this.api.log(
                    "info",
                    `CXone API Client: Using cached token URL from context: ${cachedTokenUrl}`
                );
            }
            return cachedTokenUrl;
        }

        const issuer = this.connection.environmentUrl.trim().replace(/\/+$/, "");
        const url = `${issuer}/.well-known/openid-configuration`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                `CXone API Client: Error getting token URL: ${response.status}: ${response.statusText}`
            );
        }

        const data: CXoneOpenIdConfigResponse = await response.json();
        if (!data.token_endpoint) {
            throw new Error(
                "CXone API Client: Token Endpoint URL not found in discovery response"
            );
        }

        if (this.api.addToContext) {
            this.api.addToContext("cxoneTokenUrl", data.token_endpoint, "simple");
        }
        return data.token_endpoint;
    }

    /**
     * Get API endpoint URL via discovery service (with caching)
     */
    async getApiEndpoint(issuer: string, tenantId: string): Promise<string> {
        const cachedApiUrl = this.context.cxoneApiUrl;
        if (cachedApiUrl) {
            if (this.api.log) {
                this.api.log(
                    "info",
                    `CXone API Client: Using cached API URL from context: ${cachedApiUrl}`
                );
            }
            return cachedApiUrl;
        }

        const url = `${issuer}/.well-known/cxone-configuration?tenantId=${tenantId}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                `CXone API Client: Error getting endpoint URL: ${response.status}: ${response.statusText}`
            );
        }

        const data: CXoneConfigResponse = await response.json();
        if (!data.api_endpoint) {
            throw new Error(
                "CXone API Client: API endpoint not found in discovery response"
            );
        }

        if (this.api.addToContext) {
            this.api.addToContext("cxoneApiUrl", data.api_endpoint, "simple");
        }
        return data.api_endpoint;
    }

    /**
     * Send handover signal to CXone
     */
    async sendSignalHandover(
        contactId: string,
        action: HandoverAction,
        otherParams: string[] = []
    ): Promise<number> {
        const tokens = await this.getToken();
        const decodedToken = this.decodeToken(tokens.id_token);
        const apiEndpointUrl = await this.getApiEndpoint(decodedToken.iss, decodedToken.tenantId);

        const url = `${apiEndpointUrl}/inContactAPI/services/${CXONE_API_VERSION}/interactions/${encodeURIComponent(contactId)}/signal?p1=${encodeURIComponent(action)}`;

        // Prepare POST body: p2, p3, etc.
        const bodyObj: { [key: string]: string } = {};
        otherParams.forEach((val, index) => {
            bodyObj[`p${index + 2}`] = val;
        });

        if (this.api.log) {
            this.api.log(
                "info",
                `CXone API Client: Posting handover signal to URL: ${url} with body: ${JSON.stringify(bodyObj)}`
            );
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyObj)
        });

        if (!response.ok) {
            throw new Error(
                `CXone API Client: Error sending handover signal: ${response.status}: ${response.statusText}`
            );
        }

        return response.status;
    }

    /**
     * Send generic signal to CXone
     */
    async sendSignal(contactId: string, signalParams: string[]): Promise<number> {
        if (!Array.isArray(signalParams) || signalParams.length === 0) {
            throw new Error(
                "CXone API Client: signalParams must include at least one parameter (p1)"
            );
        }

        const tokens = await this.getToken();
        const decodedToken = this.decodeToken(tokens.id_token);
        const apiEndpointUrl = await this.getApiEndpoint(decodedToken.iss, decodedToken.tenantId);

        const queryString = signalParams
            .map((val, index) => `p${index + 1}=${encodeURIComponent(val)}`)
            .join("&");

        const url = `${apiEndpointUrl}/inContactAPI/services/${CXONE_API_VERSION}/interactions/${encodeURIComponent(contactId)}/signal?${queryString}`;

        if (this.api.log) {
            this.api.log("info", `CXone API Client: Sending signal to URL: ${url}`);
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokens.access_token}`
            }
        });

        if (!response.ok) {
            throw new Error(
                `CXone API Client: Error sending signal: ${response.status}: ${response.statusText}`
            );
        }

        return response.status;
    }

    /**
     * Post transcript to TMS
     */
    async postTranscript(tmsPayload: any): Promise<number> {
        const tokens = await this.getToken();
        const decodedToken = this.decodeToken(tokens.id_token);
        const apiEndpointUrl = await this.getApiEndpoint(decodedToken.iss, decodedToken.tenantId);

        const url = `${apiEndpointUrl}/aai/tms/transcripts/post`;
        if (this.api.log) {
            this.api.log("info", `CXone API Client: Posting transcript to TMS: ${url}`);
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(tmsPayload)
        });

        if (!response.ok) {
            throw new Error(
                `CXone API Client: Error posting to TMS: ${response.status}: ${response.statusText}`
            );
        }

        return response.status;
    }

    /**
     * Decode JWT token (without verification - tokens are already validated by CXone)
     */
    private decodeToken(idToken: string): DecodedJWTToken {
        const decoded = jwt.decode(idToken);
        if (!decoded || typeof decoded !== "object") {
            throw new Error("CXone API Client: Failed to decode JWT token");
        }
        return decoded as DecodedJWTToken;
    }
}

