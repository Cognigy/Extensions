import * as crypto from "crypto";

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

// Function to get bearer token
export const getToken = async (api: any, context: any, bToken: string, uValue: string, pValue: string, tokenUrl: string) => {
    const cachedData = context?.cxoneEncryptedToken;
    const cachedTime = context?.cxoneTokenTimestamp;
    // Check if token exists and is fresh (less than 50 minutes old)
    if (cachedData && cachedTime) {
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
    api.log("info", "CXone -> getToken: Cached new encrypted CXone token in context.");
    return data;
};

// Function to get token URL via discovery service
export const getCxoneOpenIdUrl = async (api: any, context: any, issuer: string) => {
    // Check if URL is already cached
    const cachedTokenUrl = context?.cxoneTokenUrl;
    if (cachedTokenUrl) {
        api.log("info", `CXone -> getCxoneOpenIdUrl: Using cached CXone token URL from context: ${cachedTokenUrl}`);
        return cachedTokenUrl;
    }
    // if not cached
    const url = `${issuer}/.well-known/openid-configuration`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`CXone -> getCxoneOpenIdUrl: Error getting token URL: ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.token_endpoint) {
        throw new Error(`CXone -> getCxoneOpenIdUrl: Token Endpoint URL not found in discovery response`);
    }
    api.addToContext("cxoneTokenUrl", data.token_endpoint, 'simple');
    return data.token_endpoint;
};

// Function to get API endpoint via discovery service
export const getCxoneConfigUrl = async (api: any, context: any, issuer: string, tenant: string) => {
    // Check if URL is already cached
    const cachedApiUrl = context?.cxoneApiUrl;
    if (cachedApiUrl) {
        api.log("info", `CXone -> getCxoneConfigUrl: Using cached API URL from context: ${cachedApiUrl}`);
        return cachedApiUrl;
    }
    // if not cached
    const url = `${issuer}/.well-known/cxone-configuration?tenantId=${tenant}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`CXone -> getCxoneConfigUrl: Error getting endpoint URL: ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.api_endpoint) {
        throw new Error(`CXone -> getCxoneConfigUrl: API endpoint not found in discovery response`);
    }
    api.addToContext("cxoneApiUrl", data.api_endpoint, 'simple');
    return data.api_endpoint;
};

// Function to handover action to CXone
export const sendSignalHandover = async (api: any, apiEndpointUrl: string, token: string, contactId: string, action: string, otherParms: any[] = []) => {
    let url = `${apiEndpointUrl}/inContactAPI/services/v30.0/interactions/${encodeURIComponent(contactId)}/signal?p1=${encodeURIComponent(action)}`;
    otherParms.forEach((val, index) => url += `&p${index + 2}=${encodeURIComponent(val)}`);
    api.log("info", `CXone -> sendSignalHandover: About to signal to URL: ${url}`);
    const headers = { Authorization: `Bearer ${token}` };
    const response = await fetch(url, { method: "POST", headers });
    if (!response.ok) {
        throw new Error(`CXone -> sendSignalHandover: Error sending signal: ${response.status}: ${response.statusText}`);
    }
    return response.status;
};

// Function to send signal to CXone
export const sendSignal = async (api: any, apiEndpointUrl: string, token: string, contactId: string, signalParms: any[] = []) => {
    if (!Array.isArray(signalParms) || signalParms.length === 0)
        throw new Error("CXone -> sendSignal: signalParms must include at least one parameter (p1)");

    const queryString = signalParms
        .map((val, index) => `p${index + 1}=${encodeURIComponent(val)}`)
        .join("&");

    const url = `${apiEndpointUrl}/inContactAPI/services/v30.0/interactions/${encodeURIComponent(contactId)}/signal?${queryString}`;

    api.log("info", `CXone -> sendSignal: About to signal to URL: ${url}`);
    const headers = { Authorization: `Bearer ${token}` };
    const response = await fetch(url, { method: "POST", headers });
    if (!response.ok) {
        throw new Error(`CXone -> sendSignal: Error sending signal: ${response.status}: ${response.statusText}`);
    }
    return response.status;
};

// Function to post transcript to TMS
export const postToTMS = async (api: any, apiEndpointUrl: string, token: string, tmsPayload: any) => {
    const url = `${apiEndpointUrl}/aai/tms/transcripts/post`;
    api.log("info", `CXone -> postToTMS: About to post to URL: ${url}`);
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(tmsPayload) });
    if (!response.ok) {
        throw new Error(`CXone -> postToTMS: Error posting to TMS: ${response.status}: ${response.statusText}`);
    }
    return response.status;
};