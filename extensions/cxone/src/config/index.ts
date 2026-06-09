/**
 * Configuration constants for CXone Extension
 */

/**
 * Sentinel contact ID used to skip API calls (test/development mode)
 */
export const SENTINEL_CONTACT_ID = "100000000000";

/**
 * Token cache TTL in minutes
 * Tokens are considered fresh if less than this age
 */
export const TOKEN_CACHE_TTL_MINUTES = 50;

/**
 * Delay in milliseconds before returning control after handover
 * Prevents unwanted messages during handover process
 */
export const HANDOVER_DELAY_MS = 5000;

/**
 * Delay (ms) before routing to a child node, to let fire-and-forget api.* writes
 * (output / log / addToContext / setNextNode) flush to the runtime's gRPC stream
 * before this node returns and the runtime ends the stream. The api methods are
 * void (no Promise to await), so this short settle is the only way to avoid the
 * runtime ending the stream while a write is still in flight, which surfaces as
 * "13 INTERNAL: Write error: write after end" and halts the flow.
 */
export const SIGNAL_STREAM_SETTLE_MS = 500;

/**
 * CXone API version string
 */
export const CXONE_API_VERSION = "v30.0";

/**
 * Validate environment URL format
 */
export function validateEnvironmentUrl(url: string): boolean {
    if (!url || typeof url !== "string") {
        return false;
    }
    try {
        const parsed = new URL(url.trim());
        return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
        return false;
    }
}

/**
 * Normalize environment URL (remove trailing slashes)
 */
export function normalizeEnvironmentUrl(url: string): string {
    return url.trim().replace(/\/+$/, "");
}

/**
 * Validate connection configuration
 */
export function validateConnection(connection: {
    environmentUrl?: string;
    accessKeyId?: string;
    accessKeySecret?: string;
    clientId?: string;
    clientSecret?: string;
}): { valid: boolean; error?: string } {
    if (!connection) {
        return { valid: false, error: "Connection configuration is required" };
    }

    if (!connection.environmentUrl || connection.environmentUrl.trim() === "") {
        return { valid: false, error: "Environment URL is required" };
    }

    if (!validateEnvironmentUrl(connection.environmentUrl)) {
        return { valid: false, error: "Environment URL must be a valid HTTP/HTTPS URL" };
    }

    if (!connection.accessKeyId || connection.accessKeyId.trim() === "") {
        return { valid: false, error: "Access Key ID is required" };
    }

    if (!connection.accessKeySecret || connection.accessKeySecret.trim() === "") {
        return { valid: false, error: "Access Key Secret is required" };
    }

    if (!connection.clientId || connection.clientId.trim() === "") {
        return { valid: false, error: "Client ID is required" };
    }

    if (!connection.clientSecret || connection.clientSecret.trim() === "") {
        return { valid: false, error: "Client Secret is required" };
    }

    return { valid: true };
}

