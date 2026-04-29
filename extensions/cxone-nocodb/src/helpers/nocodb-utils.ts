// Generic authenticated NocoDB API call using xc-token header
export const nocodbApiCall = async (
    serverUrl: string,
    apiToken: string,
    method: string,
    path: string,
    body?: object
): Promise<any> => {
    const hasBody = method !== "GET" && body !== undefined;
    const base = serverUrl.replace(/\/+$/, "");
    const url = `${base}${path}`;

    const headers: Record<string, string> = { "xc-token": apiToken };
    if (hasBody) { headers["Content-Type"] = "application/json"; }

    const response = await fetch(url, {
        method,
        headers,
        body: hasBody ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `NocoDB API Error: ${response.status} - ${response.statusText} [${method} ${url}]`;
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.msg) {
                errorMessage += ` - ${errorJson.msg}`;
            } else if (errorJson.message) {
                errorMessage += ` - ${errorJson.message}`;
            }
        } catch { /* ignore parse error */ }
        throw new Error(errorMessage);
    }

    const responseText = await response.text();
    try { return JSON.parse(responseText); } catch { return responseText; }
};

// Validate that a Table ID is non-empty and contains no slash
export const validateTableId = (tableId: string, nodeName: string): void => {
    const id = tableId.trim();
    if (!id) {
        throw new Error(`${nodeName}: Table ID is required`);
    }
    if (id.includes("/")) {
        throw new Error(
            `${nodeName}: Table ID must not contain a slash — use only the table ID part, e.g. "md_xxxxxxxxxxxx" (found: "${id}")`
        );
    }
};

// Validate that a Base ID is non-empty and contains no slash
export const validateBaseId = (baseId: string, nodeName: string): void => {
    const id = baseId.trim();
    if (!id) {
        throw new Error(`${nodeName}: Base ID is required`);
    }
    if (id.includes("/")) {
        throw new Error(
            `${nodeName}: Base ID must not contain a slash — use only the base ID part (found: "${id}")`
        );
    }
};

// Build path for record operations: /api/v2/tables/{tableId}/records[/{rowId}]
export const buildTableRecordsPath = (tableId: string, rowId?: string | number): string => {
    let path = `/api/v2/tables/${tableId.trim()}/records`;
    if (rowId !== undefined && rowId !== null && String(rowId).trim() !== "") {
        path += `/${String(rowId).trim()}`;
    }
    return path;
};

// Build path for metadata: /api/v2/meta/bases/{baseId}/tables
export const buildMetaTablesPath = (baseId: string): string => {
    return `/api/v2/meta/bases/${baseId.trim()}/tables`;
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
