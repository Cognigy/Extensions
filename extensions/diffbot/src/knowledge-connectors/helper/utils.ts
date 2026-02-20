import { createHash } from "node:crypto";
import fetchRetry from "fetch-retry";

const fetchRetry_ = fetchRetry(global.fetch);

/**
 * Fetch method with retry configuration
 */
export async function fetchWithRetry<T = any>(
	url: string,
	options: RequestInit = {},
): Promise<T> {
	const response = await fetchRetry_(url, {
		...options,
		retries: 3,
		retryDelay: 1000,
		retryOn: [408, 429, 500, 502, 503, 504] as number[],
	});
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText} - ${url}`);
	}
	return response.json();
}

/**
 * Logs a message with a specific format.
 */
export const logMessage = (
	message: string,
	traceId: string = "extension-diffbot",
): void => {
	console.info(
		JSON.stringify({
			level: "info",
			time: new Date().toISOString(),
			message: message,
			meta: {},
			traceId: traceId,
		}),
	);
};

/**
 * Clean query string param passed to Diffbot API
 */
export const processQueryString = (querystring: string): string => {
	const normalized = new URLSearchParams(querystring)
		.toString()
		.replace("=&", "&");
	return normalized ? `?${normalized}` : "";
};

/**
 * Calculate a SHA-256 hash from an array of strings.
 */
export const calculateContentHash = (content: string[]): string => {
	const hash = createHash("sha256");
	content.forEach((c) => {
		hash.update(c);
	});
	return hash.digest("hex");
};
