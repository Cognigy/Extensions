import * as crypto from "crypto";

// Derive HMAC SHA256 signature
export const getServerTokenSignature = (key: string, secret: string, user: string) => {
    const epoch = Math.floor(Date.now() / 1000);
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${key}_${epoch}_${user}`);
    const hash = hmac.digest("hex");
    return `tkn_${key}_${epoch}_${user}_${hash}`;
};

// Function to exchange Server API Token for Auth Token URL
export const getAuthUrl = (hostname: string, signature: string, redirect?: string) => {
    let url = `https://${hostname}/@api/deki/users/authenticate?x-deki-token=${encodeURIComponent(signature)}`;
    if (redirect) {
        url += `&redirect=${encodeURIComponent(redirect)}`;
    }
    return url;
};

// Function to call Expert API
export const expertApiCall = async (url: string, signature: string, method: string = "GET", body?: any) => {
    const headers: Record<string, string> = { "X-Deki-Token": signature };
    if (method !== "GET") headers["Content-Type"] = "application/json";

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
        throw new Error(`Expert API Error: ${response.status} - ${response.statusText}`);
    }
    const responseText = await response.text();
    try { return JSON.parse(responseText); } catch { return responseText; }
};