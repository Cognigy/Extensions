import * as fetchRetry from 'fetch-retry';
const fetchRetry_ = (fetchRetry as any)(global.fetch);

/**
 * Fetch method with retry configuration
 */
export async function fetchWithRetry(url: string, options: RequestInit = {}): Promise<any> {
    const response = await fetchRetry_(url, {
        ...options,
        retries: 3,
        retryDelay: 1000,
        retryOn: [408, 429, 500, 502, 503, 504] as number[]
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${url}`);
    }

    return response.json();
}

/**
 * Cleans and refines title strings by removing protocols, replacing slashes with hyphens,
 * and removing query parameters to create valid title strings for knowledge sources.
 */
export function cleanTitle(title: string): string {
    title = title.replace(/^(https?:\/\/)?(www\.)?/, "")
                 .replace(/\/|\./g, "-")
                 .replace(/\?.*$/, "");
    return title;
}

/**
 * Logs a message with a specific format.
 */
export function logMessage(message: string, traceId: string = "extension-diffbot"): void {
    console.log(JSON.stringify({
        level: "info",
        time: new Date().toISOString(),
        message: message,
        meta: {},
        traceId: traceId
    }));
}

