import * as crypto from "crypto";
import { redactTmsPayload } from "./redact.js";

// Helper to derive a 256-bit AES key from username and password
const deriveKey = (username: string, password: string) => {
  const hash = crypto.createHash("sha256");
  hash.update(username + ":" + password);
  return hash.digest().subarray(0, 32);
};

// Function to encrypt token data
const encryptToken = (token: string, username: string, password: string) => {
  const key = deriveKey(username, password);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(token, "utf8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("base64") + ":" + encrypted;
};

// Function to decrypt token data
const decryptToken = (encryptedToken: string, username: string, password: string) => {
  const key = deriveKey(username, password);
  const [ivStr, enc] = encryptedToken.split(":");
  const iv = Buffer.from(ivStr, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(enc, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// Identifies what a cached value belongs to, without putting the environment or the access key
// itself into the context. Cached values are only reused for the same environment / credentials.
const cacheKeyFor = (...parts: string[]) => {
    return crypto.createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
};

// Function to get bearer token
export const getToken = async (api: any, context: any, bToken: string, uValue: string, pValue: string, tokenUrl: string) => {
    const cachedData = context?.cxoneEncryptedToken;
    const cachedTime = context?.cxoneTokenTimestamp;
    const tokenCacheKey = cacheKeyFor(tokenUrl, uValue);
    // A token is only valid for the environment and the credentials it was issued for
    if (cachedData && context?.cxoneTokenCacheKey && context.cxoneTokenCacheKey !== tokenCacheKey) {
        api.log("info", "CXone -> getToken: Cached token belongs to a different environment or connection, requesting a new one.");
    } else if (cachedData && cachedTime) {
        const ageMinutes = (Date.now() - cachedTime) / (1000 * 60);
        if (ageMinutes < 50) {
            try {
                const token = decryptToken(cachedData, uValue, pValue);
                api.log("info", `CXone -> getToken: Using cached CXone token, age: ${Math.floor(ageMinutes)} min`);
                return JSON.parse(token);
            } catch (err) {
                api.log("warn", "CXone -> getToken: Failed to decrypt cached CXone token, requesting new one.");
            }
        } else {
            api.log("info", "CXone -> getToken: Cached token expired (older than 50 min), refreshing...");
        }
    }
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + bToken
    };
    const body = new URLSearchParams({ grant_type: "password", username: uValue, password: pValue });
    const response = await fetch(tokenUrl, { method: "POST", headers, body });
    if (!response.ok) {
        throw new Error(`CXone -> getToken: Error getting bearer token: ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();

    // Encrypt and store in context
    const encrypted = encryptToken(JSON.stringify(data), uValue, pValue);
    api.addToContext("cxoneEncryptedToken", encrypted, "simple");
    api.addToContext("cxoneTokenTimestamp", Date.now(), "simple");
    api.addToContext("cxoneTokenCacheKey", tokenCacheKey, "simple");
    api.log("info", "CXone -> getToken: Cached new encrypted CXone token in context.");
    return data;
};

// Drop the cached token so the next getToken() call issues a fresh one.
export const clearCachedToken = (api: any, context: any): void => {
    api.addToContext("cxoneEncryptedToken", "", "simple");
    api.addToContext("cxoneTokenTimestamp", 0, "simple");
    if (context && typeof context === "object") {
        context.cxoneEncryptedToken = "";
        context.cxoneTokenTimestamp = 0;
    }
    api.log("info", "CXone -> clearCachedToken: Dropped the cached CXone token.");
};

// A function that drops the cached token, requests a new one and returns its access_token.
export type TokenRefresher = () => Promise<string>;

// Build a refresher for a node that already resolved its connection and token URL. Pass the result
// to postToTMS / sendSignal / sendSignalHandover / fetchWithAuthRetry to survive an expired token.
export const makeTokenRefresher = (api: any, context: any, basicToken: string, accessKeyId: string, accessKeySecret: string, tokenUrl: string): TokenRefresher => {
    // A node can make several authenticated calls (e.g. Exit Interaction posts the transcript and
    // then signals CXone), each still holding the token it captured before the refresh. The token
    // issued here is reused by the later calls instead of asking CXone for another one.
    let refreshedToken: string | undefined;
    return async () => {
        if (refreshedToken) {
            api.log("info", "CXone -> makeTokenRefresher: Reusing the token already refreshed during this node execution.");
            return refreshedToken;
        }
        clearCachedToken(api, context);
        const freshTokens = await getToken(api, context, basicToken, accessKeyId, accessKeySecret, tokenUrl);
        const accessToken: string = freshTokens.access_token;
        refreshedToken = accessToken;
        return accessToken;
    };
};

// Run an authenticated request. CXone tokens are cached for 50 minutes, but a tenant may issue
// shorter lived ones - if the token is rejected, it is refreshed and the request is retried once.
const requestWithTokenRetry = async (api: any, label: string, token: string, doFetch: (accessToken: string) => Promise<Response>, refreshToken?: TokenRefresher): Promise<Response> => {
    const response = await doFetch(token);
    if (response.status !== 401 && response.status !== 403) return response;
    if (!refreshToken) return response;

    api.log("warn", `${label}: CXone rejected the token (${response.status} ${response.statusText}); refreshing the token and retrying once.`);
    let freshToken: string;
    try {
        freshToken = await refreshToken();
    } catch (refreshError: any) {
        api.log("error", `${label}: Could not refresh the CXone token: ${refreshError.message}`);
        return response; // report the original 401/403
    }
    const retried = await doFetch(freshToken);
    api.log("info", `${label}: Retry with the refreshed token returned ${retried.status} ${retried.statusText}`);
    return retried;
};

// Same as a plain fetch with a bearer token, but retries once with a refreshed token on 401/403.
export const fetchWithAuthRetry = async (api: any, label: string, token: string, build: (accessToken: string) => { url: string; init: any }, refreshToken?: TokenRefresher): Promise<Response> => {
    return requestWithTokenRetry(api, label, token, (accessToken: string) => {
        const { url, init } = build(accessToken);
        return fetch(url, init);
    }, refreshToken);
};

// Reads a JSON response, reporting a non-JSON body (e.g. a proxy or gateway error page served with
// a 200) instead of failing with "Unexpected token <".
const readJsonResponse = async (api: any, response: Response, label: string): Promise<any> => {
    const bodyText = await response.text();
    try {
        return JSON.parse(bodyText);
    } catch {
        api.log("error", `${label}: expected JSON but got: ${bodyText.slice(0, 200)}`);
        throw new Error(`${label}: the response was not valid JSON`);
    }
};

// Function to get token URL via discovery service
export const getCxoneOpenIdUrl = async (api: any, context: any, issuer: string) => {
    // Check if the URL is already cached for THIS environment
    const cacheKey = cacheKeyFor(issuer);
    const cachedTokenUrl = context?.cxoneTokenUrl;
    if (cachedTokenUrl && context?.cxoneTokenUrlCacheKey === cacheKey) {
        api.log("info", `CXone -> getCxoneOpenIdUrl: Using cached CXone token URL from context: ${cachedTokenUrl}`);
        return cachedTokenUrl;
    }
    if (cachedTokenUrl) {
        api.log("info", `CXone -> getCxoneOpenIdUrl: Cached token URL belongs to a different environment, resolving ${issuer} again.`);
    }
    // if not cached
    const url = `${issuer}/.well-known/openid-configuration`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`CXone -> getCxoneOpenIdUrl: Error getting token URL: ${response.status}: ${response.statusText}`);
    }
    const data = await readJsonResponse(api, response, "CXone -> getCxoneOpenIdUrl");
    if (!data.token_endpoint) {
        throw new Error(`CXone -> getCxoneOpenIdUrl: Token Endpoint URL not found in discovery response`);
    }
    api.addToContext("cxoneTokenUrl", data.token_endpoint, 'simple');
    api.addToContext("cxoneTokenUrlCacheKey", cacheKey, 'simple');
    return data.token_endpoint;
};

// Function to get API endpoint via discovery service
export const getCxoneConfigUrl = async (api: any, context: any, issuer: string, tenant: string) => {
    // Check if the URL is already cached for THIS environment and tenant - the api_endpoint is tenant specific
    const cacheKey = cacheKeyFor(issuer, tenant);
    const cachedApiUrl = context?.cxoneApiUrl;
    if (cachedApiUrl && context?.cxoneApiUrlCacheKey === cacheKey) {
        api.log("info", `CXone -> getCxoneConfigUrl: Using cached API URL from context: ${cachedApiUrl}`);
        return cachedApiUrl;
    }
    if (cachedApiUrl) {
        api.log("info", `CXone -> getCxoneConfigUrl: Cached API URL belongs to a different environment or tenant, resolving again.`);
    }
    // if not cached
    const url = `${issuer}/.well-known/cxone-configuration?tenantId=${tenant}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`CXone -> getCxoneConfigUrl: Error getting endpoint URL: ${response.status}: ${response.statusText}`);
    }
    const data = await readJsonResponse(api, response, "CXone -> getCxoneConfigUrl");
    if (!data.api_endpoint) {
        throw new Error(`CXone -> getCxoneConfigUrl: API endpoint not found in discovery response`);
    }
    api.addToContext("cxoneApiUrl", data.api_endpoint, 'simple');
    api.addToContext("cxoneApiUrlCacheKey", cacheKey, 'simple');
    return data.api_endpoint;
};

// Function to handover action to CXone
export const sendSignalHandover = async (api: any, apiEndpointUrl: string, token: string, contactId: string, action: string, otherParms: any[] = [], refreshToken?: TokenRefresher) => {
    const url = `${apiEndpointUrl}/inContactAPI/services/v30.0/interactions/${encodeURIComponent(contactId)}/signal?p1=${encodeURIComponent(action)}`;
    // Prepare POST body: p2, p3, etc., raw strings
    const bodyObj: Record<string, any> = {};
    otherParms.forEach((val, index) => {
        bodyObj[`p${index + 2}`] = val;
    });
    api.log("info", `CXone -> sendSignalHandover: Posting to URL: ${url} with body: ${JSON.stringify(bodyObj)}`);
    const response = await fetchWithAuthRetry(api, "CXone -> sendSignalHandover", token, (accessToken: string) => ({
        url,
        init: {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyObj)
        }
    }), refreshToken);
    if (!response.ok) {
        throw new Error(`CXone -> sendSignalHandover: Error sending signal: ${response.status}: ${response.statusText}`);
    }
    return response.status;
};

// Function to send signal to CXone
export const sendSignal = async (api: any, apiEndpointUrl: string, token: string, contactId: string, signalParms: any[] = [], refreshToken?: TokenRefresher) => {
    if (!Array.isArray(signalParms) || signalParms.length === 0)
        throw new Error("CXone -> sendSignal: signalParms must include at least one parameter (p1)");

    const queryString = signalParms
        .map((val, index) => `p${index + 1}=${encodeURIComponent(val)}`)
        .join("&");

    const url = `${apiEndpointUrl}/inContactAPI/services/v30.0/interactions/${encodeURIComponent(contactId)}/signal?${queryString}`;

    api.log("info", `CXone -> sendSignal: About to signal to URL: ${url}`);
    const response = await fetchWithAuthRetry(api, "CXone -> sendSignal", token, (accessToken: string) => ({
        url,
        init: { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }
    }), refreshToken);
    if (!response.ok) {
        throw new Error(`CXone -> sendSignal: Error sending signal: ${response.status}: ${response.statusText}`);
    }
    return response.status;
};

// Function to post transcript to TMS
export const postToTMS = async (api: any, apiEndpointUrl: string, token: string, tmsPayload: any, refreshToken?: TokenRefresher) => {
    const url = `${apiEndpointUrl}/aai/tms/transcripts/post`;
    const bodyStr = JSON.stringify(tmsPayload);
    api.log("info", `CXone -> postToTMS: POST ${url}`);
    api.log("info", `CXone -> postToTMS: Headers: ${JSON.stringify({ Authorization: "Bearer ***", "Content-Type": "application/json" })}`);
    // the transcript is customer data - log the payload with the message bodies redacted
    api.log("info", `CXone -> postToTMS: Payload (${bodyStr.length} chars): ${JSON.stringify(redactTmsPayload(tmsPayload))}`);
    const response = await fetchWithAuthRetry(api, "CXone -> postToTMS", token, (accessToken: string) => ({
        url,
        init: { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: bodyStr }
    }), refreshToken);
    api.log("info", `CXone -> postToTMS: Response status: ${response.status} ${response.statusText}`);
    if (!response.ok) {
        const responseBody = await response.text();
        api.log("error", `CXone -> postToTMS: Response body: ${responseBody}`);
        // the token is refreshed automatically on 401/403 only - point at the cause if CXone reports
        // an authentication problem under a different status code
        if (/token|expired|unauthori[sz]ed/i.test(responseBody)) {
            api.log("error", `CXone -> postToTMS: The response mentions an authentication problem under status ${response.status}. The automatic token refresh only triggers on 401/403, so this call was not retried - check the CXone connection's access key and roles.`);
        }
        throw new Error(`CXone -> postToTMS: Error posting to TMS: ${response.status}: ${response.statusText} | Body: ${responseBody}`);
    }
    return response.status;
};