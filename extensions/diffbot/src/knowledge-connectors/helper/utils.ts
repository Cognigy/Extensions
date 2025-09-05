// eslint-disable-next-line @typescript-eslint/no-require-imports
const fetchRetry = require('fetch-retry');
const fetchRetry_ = fetchRetry(global.fetch);

/**
 * Fetch method with retry configuration
 */
export async function fetchWithRetry(url: string, options: RequestInit = {}): Promise<any> {
    const response = await fetchRetry_(url, {
        ...options,
        retries: 3,
        retryDelay: 1000,
        retryOn: [408, 429, 500, 502, 503, 504] as any
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${url}`);
    }

    return response.json();
}

export async function cleanTitle(title: string): Promise<string> {
    title = title.replace(/https?:\/\//, "").replace(/\//g, "-").replace(/\?.*$/, "");
    return title;
}