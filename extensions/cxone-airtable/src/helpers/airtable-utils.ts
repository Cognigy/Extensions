const AIRTABLE_BASE_URL = "https://api.airtable.com/v0";
const AIRTABLE_META_URL = "https://api.airtable.com/v0/meta";

// Generic authenticated AirTable API call using Bearer token
export const airtableApiCall = async (
    token: string,
    method: string,
    url: string,
    body?: object
): Promise<any> => {
    const hasBody = method !== "GET" && method !== "DELETE" && body !== undefined;
    const headers: Record<string, string> = { "Authorization": `Bearer ${token}` };
    if (hasBody) { headers["Content-Type"] = "application/json"; }

    const response = await fetch(url, {
        method,
        headers,
        body: hasBody ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `AirTable API Error: ${response.status} - ${response.statusText} [${method} ${url}]`;
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error?.message) {
                errorMessage += ` - ${errorJson.error.message}`;
            } else if (typeof errorJson.error === "string") {
                errorMessage += ` - ${errorJson.error}`;
            }
        } catch { /* ignore parse error */ }
        throw new Error(errorMessage);
    }

    const responseText = await response.text();
    try { return JSON.parse(responseText); } catch { return responseText; }
};

// Validate that a Base ID looks correct (starts with "app", no slashes)
export const validateBaseId = (baseId: string, nodeName: string): void => {
    const id = baseId.trim();
    if (!id) {
        throw new Error(`${nodeName}: Base ID is required`);
    }
    if (id.includes("/")) {
        throw new Error(
            `${nodeName}: Base ID must not contain a slash — it looks like you pasted a URL path. ` +
            `Use only the base ID part, e.g. "appXXXXXXXXXXXXXX" (found: "${id}")`
        );
    }
    if (!id.startsWith("app")) {
        throw new Error(`${nodeName}: Base ID should start with "app" (found: "${id}")`);
    }
};

// Build URL for record operations: /v0/{baseId}/{tableIdOrName}[/{recordId}]
export const buildRecordUrl = (baseId: string, tableIdOrName: string, recordId?: string): string => {
    const encoded = encodeURIComponent(tableIdOrName.trim());
    let url = `${AIRTABLE_BASE_URL}/${baseId.trim()}/${encoded}`;
    if (recordId) { url += `/${recordId.trim()}`; }
    return url;
};

// Build URL for metadata: /v0/meta/bases/{baseId}/tables
export const buildMetaTablesUrl = (baseId: string): string => {
    return `${AIRTABLE_META_URL}/bases/${baseId.trim()}/tables`;
};

// Store result in Cognigy context or input
export const storeResult = (api: any, storeLocation: string, storeKey: string, data: any): void => {
    if (storeLocation === "context") {
        api.addToContext?.(storeKey, data, "simple");
    } else {
        // @ts-ignore
        api.addToInput(storeKey, data);
    }
};
