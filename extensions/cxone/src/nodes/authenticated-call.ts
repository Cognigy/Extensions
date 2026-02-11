import { createNodeDescriptor } from "@cognigy/extension-tools";
import { AuthenticatedCallNodeParams } from "../types";
import { generateRequestId, ErrorCreators, createErrorResponse, createSuccessResponse } from "../helpers/errors";

export const cxoneAuthenticatedCall = createNodeDescriptor({
    type: "cxoneAuthenticatedCall",
    defaultLabel: "CXone Authenticated Call",
    summary: "Make an authenticated HTTP call using CXone token from input data with timeout and retry controls",

    preview: {
        key: "url",
        type: "text"
    },

    fields: [
        {
            key: "url",
            label: "URL",
            type: "cognigyText",
            description: "The complete URL for the HTTP request. Authentication will be automatically handled using CXone token from input.data.cxonetoken or context.cxonetoken.",
            params: {
                required: true
            }
        },
        {
            key: "method",
            label: "HTTP Method",
            type: "select",
            description: "Select the HTTP method for the request",
            defaultValue: "GET",
            params: {
                options: [
                    { label: "GET", value: "GET" },
                    { label: "POST", value: "POST" },
                    { label: "PUT", value: "PUT" },
                    { label: "PATCH", value: "PATCH" },
                    { label: "DELETE", value: "DELETE" }
                ],
                required: true
            }
        },
        {
            key: "headers",
            label: "Headers",
            type: "json",
            description: "Additional headers to include in the request (Authorization header will be automatically injected)",
            defaultValue: "{}",
            params: {
                required: false
            }
        },
        {
            key: "payloadType",
            label: "Payload Type",
            type: "select",
            description: "Select the format of the request body",
            defaultValue: "json",
            params: {
                options: [
                    { label: "JSON", value: "json" },
                    { label: "Text", value: "text" },
                    { label: "Form Data", value: "form" }
                ],
                required: false
            },
            condition: {
                key: "method",
                value: "GET",
                negate: true
            }
        },
        {
            key: "bodyJson",
            label: "Request Body (JSON)",
            type: "json",
            description: "Request body as JSON object",
            defaultValue: "{}",
            params: {
                required: false
            },
            condition: {
                key: "payloadType",
                value: "json"
            }
        },
        {
            key: "bodyText",
            label: "Request Body (Text)",
            type: "cognigyText",
            description: "Request body as plain text",
            defaultValue: "",
            params: {
                required: false
            },
            condition: {
                key: "payloadType",
                value: "text"
            }
        },
        {
            key: "bodyForm",
            label: "Request Body (Form Data)",
            type: "json",
            description: "Request body as key-value pairs for form data (e.g., {\"key1\": \"value1\", \"key2\": \"value2\"})",
            defaultValue: "{}",
            params: {
                required: false
            },
            condition: {
                key: "payloadType",
                value: "form"
            }
        },
        {
            key: "responseTarget",
            label: "Store Result In",
            type: "select",
            description: "Where to store the response data",
            defaultValue: "context",
            params: {
                options: [
                    { label: "Context", value: "context" },
                    { label: "Input", value: "input" }
                ],
                required: false
            }
        },
        {
            key: "responseKey",
            label: "Key to store Result",
            type: "cognigyText",
            description: "Key where response data will be stored",
            defaultValue: "cxoneApiResponse",
            params: {
                required: false
            }
        },
        {
            key: "storeResponseHeaders",
            label: "Store Response Headers",
            type: "toggle",
            description: "Store response headers alongside response data",
            defaultValue: false,
            params: {
                required: false
            }
        },
        {
            key: "timeoutMs",
            label: "Timeout (ms)",
            type: "number",
            description: "Request timeout in milliseconds (1-20 seconds). Prevents requests from hanging indefinitely. Hard 20-second execution budget applies regardless of this setting.",
            defaultValue: 8000,
            params: {
                required: false,
                min: 1000,
                max: 20000
            }
        },
        {
            key: "enableRetry",
            label: "Enable Retry",
            type: "toggle",
            description: "Enable automatic retry on network errors, timeouts, and server errors. Additional attempts beyond initial request.",
            defaultValue: false,
            params: {
                required: false
            }
        },
        {
            key: "retryAttempts",
            label: "Retry Attempts",
            type: "number",
            description: "Number of additional retry attempts after the initial request fails. Example: 2 retry attempts = 3 total attempts (1 initial + 2 retries). Uses exponential backoff with jitter.",
            defaultValue: 1,
            params: {
                required: false,
                min: 1,
                max: 5
            },
            condition: {
                key: "enableRetry",
                value: true
            }
        },
        {
            key: "failOnNon2xx",
            label: "Fail on Non-2xx Status",
            type: "toggle",
            description: "When enabled, non-2xx HTTP responses produce structured errors. When disabled, non-2xx responses are treated as successful with status and body preserved.",
            defaultValue: true,
            params: {
                required: false
            }
        },
        {
            key: "debugMode",
            label: "Debug Mode",
            type: "toggle",
            description: "Enable enhanced logging with request/response details. Sensitive data (tokens, credentials) will be redacted for security.",
            defaultValue: false,
            params: {
                required: false
            }
        },
        {
            key: "allowInsecureSSL",
            label: "Allow Insecure SSL",
            type: "toggle",
            description: "Allow requests to HTTPS endpoints with unauthorized or self-signed SSL certificates. WARNING: Only enable this for development/testing environments.",
            defaultValue: false,
            params: {
                required: false
            }
        }
    ],

    sections: [
        {
            key: "headersSection",
            label: "Headers",
            defaultCollapsed: true,
            fields: [
                "headers",
                "storeResponseHeaders"
            ]
        },
        {
            key: "payloadSection",
            label: "Payload",
            defaultCollapsed: false,
            fields: [
                "payloadType",
                "bodyJson",
                "bodyText",
                "bodyForm"
            ]
        },
        {
            key: "executionSection",
            label: "Execution",
            defaultCollapsed: true,
            fields: [
                "timeoutMs",
                "enableRetry",
                "retryAttempts"
            ]
        },
        {
            key: "errorHandlingSection",
            label: "Error Handling & Debug",
            defaultCollapsed: true,
            fields: [
                "failOnNon2xx",
                "debugMode"
            ]
        },
        {
            key: "securitySection",
            label: "Security",
            defaultCollapsed: true,
            fields: [
                "allowInsecureSSL"
            ]
        },
        {
            key: "storageSection",
            label: "Storage Options",
            defaultCollapsed: true,
            fields: [
                "responseTarget",
                "responseKey"
            ]
        }
    ],

    form: [
        { type: "field", key: "method" },
        { type: "field", key: "url" },
        { type: "section", key: "headersSection" },
        { type: "section", key: "payloadSection" },
        { type: "section", key: "executionSection" },
        { type: "section", key: "errorHandlingSection" },
        { type: "section", key: "securitySection" },
        { type: "section", key: "storageSection" }
    ],

    appearance: {
        color: "#3694FD"
    },

    function: async ({ cognigy, config }: AuthenticatedCallNodeParams) => {
        const {
            url,
            method,
            headers = {},
            body, // Legacy field for backward compatibility
            payloadType,
            bodyJson,
            bodyText,
            bodyForm,
            timeoutMs = 8000,
            enableRetry = false,
            retryAttempts = 1,
            failOnNon2xx = true,
            debugMode = false,
            allowInsecureSSL = false,
            responseTarget = "context",
            responseKey = "cxoneApiResponse",
            storeResponseHeaders = false
        } = config;
        const { api, input } = cognigy;

        // Helper function to determine payload data based on payload type
        const getPayloadData = () => {
            if (method === "GET" || method === "DELETE") {
                return undefined;
            }

            // Use new payload fields if available
            if (payloadType && (bodyJson !== undefined || bodyText !== undefined || bodyForm !== undefined)) {
                switch (payloadType) {
                    case "json":
                        return bodyJson;
                    case "text":
                        return bodyText;
                    case "form":
                        return bodyForm;
                    default:
                        return undefined;
                }
            }

            // Fallback to legacy body field for backward compatibility
            return body;
        };

        // Helper function to prepare request body and content type
        const prepareRequestBody = (currentPayloadType: string | undefined, payloadData: any) => {
            if (!payloadData || method === "GET" || method === "DELETE") {
                return { body: undefined, contentType: "application/json" };
            }

            let requestBody: string;
            let contentType: string;

            // Determine effective payload type
            const effectivePayloadType = currentPayloadType || "json"; // Default to JSON for legacy compatibility

            switch (effectivePayloadType) {
                case "json":
                    contentType = "application/json";
                    if (typeof payloadData === "string") {
                        requestBody = payloadData;
                    } else {
                        requestBody = JSON.stringify(payloadData);
                    }
                    break;
                case "text":
                    contentType = "text/plain";
                    requestBody = String(payloadData);
                    break;
                case "form":
                    contentType = "application/x-www-form-urlencoded";
                    if (typeof payloadData === "object" && payloadData !== null) {
                        // Convert object to URL-encoded string
                        const params = new URLSearchParams();
                        for (const [key, value] of Object.entries(payloadData)) {
                            params.append(key, String(value));
                        }
                        requestBody = params.toString();
                    } else {
                        requestBody = String(payloadData);
                    }
                    break;
                default:
                    // Fallback to JSON for unknown types
                    contentType = "application/json";
                    if (typeof payloadData === "string") {
                        requestBody = payloadData;
                    } else {
                        requestBody = JSON.stringify(payloadData);
                    }
                    break;
            }

            return { body: requestBody, contentType };
        };

        // Helper function to store data based on target and key
        const storeData = (target: string, key: string, data: unknown) => {
            if (!key) return;

            try {
                switch (target) {
                    case "context":
                        api.addToContext(key, data, "simple");
                        break;
                    case "input":
                        input[key] = data;
                        break;
                    default:
                        api.log("error", `Unsupported response target: ${target}`);
                        break;
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                api.log("error", `Failed to store response data with key ${key}: ${errorMessage}`);
            }
        };

        // Helper function to redact sensitive data for debug logging
        const redactSensitiveData = (obj: any): any => {
            if (typeof obj !== 'object' || obj === null) {
                return obj;
            }

            if (Array.isArray(obj)) {
                return obj.map(item => redactSensitiveData(item));
            }

            const redacted = { ...obj };
            const sensitiveKeys = [
                'authorization',
                'bearer',
                'token',
                'password',
                'secret',
                'key',
                'credential',
                'auth'
            ];

            for (const [key, value] of Object.entries(redacted)) {
                const lowerKey = key.toLowerCase();
                if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
                    if (typeof value === 'string' && value.length > 0) {
                        redacted[key] = `***${value.substring(Math.max(0, value.length - 4))}`;
                    } else {
                        redacted[key] = '***REDACTED***';
                    }
                } else if (typeof value === 'object') {
                    redacted[key] = redactSensitiveData(value);
                }
            }

            return redacted;
        };

        // Helper function for debug logging
        const debugLog = (message: string, data?: any) => {
            if (debugMode) {
                const redactedData = data ? redactSensitiveData(data) : undefined;
                const logMessage = redactedData
                    ? `[DEBUG] Request ${requestId}: ${message} - ${JSON.stringify(redactedData, null, 2)}`
                    : `[DEBUG] Request ${requestId}: ${message}`;
                api.log("info", logMessage);
            }
        };

        // Execution configuration and constants
        const EXECUTION_BUDGET_MS = 20000; // 20 seconds hard limit (Cognigy standard)
        const MAX_BACKOFF_MS = 5000; // Maximum delay between retries
        const BASE_BACKOFF_MS = 1000; // Base delay for exponential backoff

        // Helper function for delay with jitter
        const sleep = (ms: number): Promise<void> => {
            return new Promise(resolve => setTimeout(resolve, ms));
        };

        // Helper function to calculate backoff delay with exponential backoff and jitter
        const calculateBackoffDelay = (attempt: number): number => {
            const exponentialDelay = Math.min(BASE_BACKOFF_MS * Math.pow(2, attempt - 1), MAX_BACKOFF_MS);
            const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
            return Math.floor(exponentialDelay + jitter);
        };

        // Helper function to determine if error should be retried
        const isRetryableError = (error: any, response?: Response): boolean => {
            // Network errors (fetch failures)
            if (error && !response) {
                return true;
            }

            // HTTP status codes that should be retried
            if (response && response.status) {
                return response.status >= 500 || response.status === 429;
            }

            return false;
        };

        // Helper function to create custom agent for insecure SSL if needed
        const createRequestAgent = (allowInsecure: boolean) => {
            if (!allowInsecure) {
                return undefined;
            }

            try {
                // Try to create HTTPS agent for Node.js environment
                const https = require('https');
                return new https.Agent({
                    rejectUnauthorized: false
                });
            } catch (error) {
                // If https module is not available (browser environment), return undefined
                api.log("warn", "HTTPS agent not available - allowInsecureSSL setting ignored in browser environment");
                return undefined;
            }
        };

        // Helper function to make HTTP request with timeout
        const makeHttpRequest = async (requestUrl: string, requestOptions: RequestInit, timeoutMs: number): Promise<Response> => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            try {
                const finalRequestOptions: RequestInit = {
                    ...requestOptions,
                    signal: controller.signal
                };

                // Add custom agent for insecure SSL if enabled
                if (allowInsecureSSL) {
                    const agent = createRequestAgent(true);
                    if (agent) {
                        // For Node.js environments, add the agent
                        (finalRequestOptions as any).agent = agent;
                        debugLog("Insecure SSL agent configured", {
                            allowInsecureSSL: true,
                            rejectUnauthorized: false
                        });
                    }
                }

                const response = await fetch(requestUrl, finalRequestOptions);
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    const timeoutError = new Error(`Request timeout after ${timeoutMs}ms`);
                    timeoutError.name = 'TimeoutError';
                    throw timeoutError;
                }
                throw error;
            }
        };

        // Generate unique request ID for tracking
        const requestId = generateRequestId();

        try {
            // Check for cxonetoken in input.data first, then context as fallback
            const cxoneToken = input?.data?.cxonetoken || cognigy.context?.cxonetoken;
            let tokenSource = "input.data";

            if (input?.data?.cxonetoken) {
                tokenSource = "input.data";
            } else if (cognigy.context?.cxonetoken) {
                tokenSource = "context";
            }

            if (!cxoneToken) {
                const errorResponse = ErrorCreators.missingToken(requestId);
                api.log("error", `Request ${requestId}: ${errorResponse.error?.message}`);

                if (responseTarget && responseKey) {
                    storeData(responseTarget, responseKey, errorResponse);
                }

                api.output("Authentication Error", errorResponse);
                return;
            }

            // Validate configuration
            try {
                new URL(url);
            } catch (urlError) {
                const errorResponse = ErrorCreators.invalidConfig(
                    `Invalid URL format: ${url}`,
                    { url, urlError: urlError instanceof Error ? urlError.message : String(urlError) },
                    requestId
                );
                api.log("error", `Request ${requestId}: ${errorResponse.error?.message}`);

                if (responseTarget && responseKey) {
                    storeData(responseTarget, responseKey, errorResponse);
                }

                api.output("Configuration Error", errorResponse);
                return;
            }

            // Validate headers JSON format
            let parsedHeaders: Record<string, string> = {};
            try {
                if (typeof headers === "string") {
                    parsedHeaders = JSON.parse(headers);
                } else if (typeof headers === "object" && headers !== null) {
                    parsedHeaders = headers;
                } else {
                    parsedHeaders = {};
                }
            } catch (headerError) {
                const errorResponse = ErrorCreators.invalidConfig(
                    "Invalid headers format - must be valid JSON",
                    { headers, headerError: headerError instanceof Error ? headerError.message : String(headerError) },
                    requestId
                );
                api.log("error", `Request ${requestId}: ${errorResponse.error?.message}`);

                if (responseTarget && responseKey) {
                    storeData(responseTarget, responseKey, errorResponse);
                }

                api.output("Configuration Error", errorResponse);
                return;
            }

            api.log("info", `Request ${requestId}: Using cxonetoken from ${tokenSource}`);
            api.log("info", `Request ${requestId}: Making ${method} request to: ${url}`);

            // Warning for insecure SSL configuration
            if (allowInsecureSSL) {
                api.log("warn", `Request ${requestId}: Insecure SSL mode enabled - unauthorized and self-signed certificates will be accepted. Use only in development/testing environments.`);
            }

            debugLog("Configuration validated", {
                url,
                method,
                payloadType,
                timeoutMs,
                enableRetry,
                retryAttempts,
                failOnNon2xx,
                debugMode,
                allowInsecureSSL,
                tokenSource
            });

            // Get payload data and prepare request body
            const payloadData = getPayloadData();
            const { body: requestBody, contentType: requestContentType } = prepareRequestBody(payloadType, payloadData);

            // Prepare headers with injected Authorization and appropriate Content-Type
            const requestHeaders: Record<string, string> = {
                "Content-Type": requestContentType,
                ...parsedHeaders,
                // Override any user-provided Authorization header
                "Authorization": `Bearer ${cxoneToken}`
            };

            // Prepare request options
            const requestOptions: RequestInit = {
                method,
                headers: requestHeaders
            };

            // Add body for methods that support it (not GET or DELETE)
            if (requestBody && method !== "GET" && method !== "DELETE") {
                requestOptions.body = requestBody;
            }

            debugLog("Request prepared", {
                headers: requestHeaders,
                hasBody: !!requestBody,
                bodyType: payloadType,
                bodyLength: requestBody ? requestBody.length : 0
            });

            // Execute HTTP request with retry logic and budget guard
            const startTime = Date.now();
            let lastError: Error | undefined;
            let lastResponse: Response | undefined;
            let actualAttempts = 0;
            const maxAttempts = enableRetry ? Math.min(retryAttempts + 1, 6) : 1;

            api.log("info", `Executing ${method} request with timeout: ${timeoutMs}ms, max attempts: ${maxAttempts}`);

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                actualAttempts = attempt;
                // Check execution budget before each attempt
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime >= EXECUTION_BUDGET_MS) {
                    const budgetError = createErrorResponse(
                        "Timeout",
                        `Execution budget exhausted (${EXECUTION_BUDGET_MS}ms exceeded). Request cancelled to prevent platform timeout.`,
                        500,
                        {
                            attempts: attempt - 1,
                            elapsedMs: elapsedTime,
                            budgetMs: EXECUTION_BUDGET_MS,
                            cognigyStandard: "20-second hard limit"
                        },
                        requestId
                    );

                    if (responseTarget && responseKey) {
                        storeData(responseTarget, responseKey, budgetError);
                    }

                    api.log("error", `Request ${requestId}: Execution budget exhausted after ${elapsedTime}ms`);
                    api.output("Request failed - execution budget exceeded", budgetError);
                    return;
                }

                try {
                    // Calculate remaining budget for this attempt
                    const remainingBudget = EXECUTION_BUDGET_MS - elapsedTime;
                    const effectiveTimeout = Math.min(timeoutMs, remainingBudget - 1000); // Leave 1s buffer

                    if (effectiveTimeout < 1000) {
                        throw new Error("Insufficient remaining budget for request timeout");
                    }

                    api.log("info", `Attempt ${attempt}/${maxAttempts} - timeout: ${effectiveTimeout}ms`);

                    debugLog(`Starting attempt ${attempt}/${maxAttempts}`, {
                        attempt,
                        maxAttempts,
                        effectiveTimeout,
                        elapsedTime,
                        remainingBudget: EXECUTION_BUDGET_MS - elapsedTime
                    });

                    // Make the HTTP request
                    const requestStartTime = Date.now();
                    const response = await makeHttpRequest(url, requestOptions, effectiveTimeout);
                    const requestDuration = Date.now() - requestStartTime;

                    debugLog(`Request completed`, {
                        attempt,
                        status: response.status,
                        statusText: response.statusText,
                        durationMs: requestDuration,
                        responseHeaders: Object.fromEntries(response.headers.entries())
                    });

                    // First check if this is a retryable response and we can still retry
                    if (isRetryableError(undefined, response) && attempt < maxAttempts) {
                        // This is a retryable error and we haven't reached max attempts - continue to retry
                        lastResponse = response;
                        debugLog(`Retryable HTTP error received`, {
                            attempt,
                            status: response.status,
                            statusText: response.statusText,
                            willRetry: true,
                            isRetryable: true
                        });
                        api.log("warn", `Request ${requestId}: Attempt ${attempt} received retryable status ${response.status}, will retry`);

                        // Continue to next retry attempt
                        continue;
                    } else {
                        // Either not retryable, or final attempt - parse and return response
                        let responseBody;
                        const responseContentType = response.headers.get("content-type");

                        if (responseContentType && responseContentType.includes("application/json")) {
                            responseBody = await response.json();
                        } else {
                            responseBody = await response.text();
                        }

                        debugLog("Response body parsed", {
                            contentType: responseContentType,
                            bodyType: typeof responseBody,
                            bodyLength: typeof responseBody === 'string' ? responseBody.length :
                                       typeof responseBody === 'object' ? JSON.stringify(responseBody).length : 0
                        });

                        // Handle non-2xx responses based on failOnNon2xx setting
                        if (!response.ok && failOnNon2xx) {
                            // Treat non-2xx as error when failOnNon2xx is true
                            const httpError = ErrorCreators.httpError(
                                response.status,
                                response.statusText || `HTTP ${response.status}`,
                                responseBody,
                                requestId
                            );

                            debugLog("Non-2xx treated as error", {
                                status: response.status,
                                statusText: response.statusText,
                                failOnNon2xx,
                                isRetryable: isRetryableError(undefined, response),
                                attempt,
                                maxAttempts,
                                totalDuration: Date.now() - startTime
                            });

                            if (responseTarget && responseKey) {
                                storeData(responseTarget, responseKey, httpError);
                            }

                            api.log("error", `Request ${requestId}: Non-2xx response treated as error - Status: ${response.status} (attempt ${attempt}/${maxAttempts})`);
                            api.output(`HTTP ${response.status} Error`, httpError);
                            return;
                        }

                        // Prepare result object (legacy format for backward compatibility or when failOnNon2xx is false)
                        const result: any = {
                            status: response.status,
                            body: responseBody
                        };

                        // Add headers to result if enabled
                        if (storeResponseHeaders) {
                            const responseHeaders: Record<string, string> = {};
                            response.headers.forEach((value, key) => {
                                responseHeaders[key] = value;
                            });
                            result.headers = responseHeaders;
                        }

                        // Add retry information if retries were attempted
                        if (enableRetry && attempt > 1) {
                            result.retryInfo = {
                                attempts: attempt,
                                elapsedMs: Date.now() - startTime
                            };
                        }

                        // For successful responses or when failOnNon2xx is false, use success format
                        let finalResult;
                        if (response.ok) {
                            // 2xx responses are always successful
                            finalResult = createSuccessResponse(result);
                        } else {
                            // Non-2xx with failOnNon2xx=false: treat as success but preserve status info
                            finalResult = createSuccessResponse(result);
                        }

                        const totalDuration = Date.now() - startTime;

                        debugLog("Request completed successfully", {
                            status: response.status,
                            ok: response.ok,
                            attempt,
                            maxAttempts,
                            totalDurationMs: totalDuration,
                            failOnNon2xx,
                            storeResponseHeaders,
                            responseTarget,
                            responseKey
                        });

                        api.log("info", `Request ${requestId}: Completed with status ${response.status} (attempt ${attempt}/${maxAttempts})`);

                        // Store complete response object in configured target/key
                        if (responseTarget && responseKey) {
                            storeData(responseTarget, responseKey, finalResult);
                            const headerInfo = storeResponseHeaders ? " (including headers)" : "";
                            api.log("info", `Request ${requestId}: Response stored in ${responseTarget}.${responseKey}${headerInfo}`);
                        }

                        // Output the result
                        const outputMessage = response.ok
                            ? "Request completed successfully"
                            : `Request completed with status ${response.status} (treated as success)`;
                        api.output(outputMessage, finalResult);
                        return;
                    }

                } catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));

                    // Check if error should be retried
                    if (!enableRetry || !isRetryableError(lastError) || attempt === maxAttempts) {
                        // Not retryable or final attempt - handle error appropriately
                        let errorResponse;

                        if (lastError.name === 'TimeoutError') {
                            errorResponse = ErrorCreators.timeout(timeoutMs, requestId);
                        } else {
                            errorResponse = ErrorCreators.networkError(lastError.message, requestId);
                        }

                        if (responseTarget && responseKey) {
                            storeData(responseTarget, responseKey, errorResponse);
                        }

                        api.log("error", `Request ${requestId}: ${errorResponse.error?.message} (attempt ${attempt}/${maxAttempts})`);
                        api.output("Request failed", errorResponse);
                        return;
                    }

                    api.log("warn", `Request ${requestId}: Attempt ${attempt} failed with error: ${lastError.message}, will retry`);
                }

                // Wait before next retry (skip delay on final attempt)
                if (attempt < maxAttempts) {
                    const backoffDelay = calculateBackoffDelay(attempt);
                    const remainingBudget = EXECUTION_BUDGET_MS - (Date.now() - startTime);

                    if (remainingBudget < backoffDelay + timeoutMs) {
                        // Not enough budget for delay + next attempt
                        api.log("warn", `Insufficient budget for retry delay, stopping retries`);
                        break;
                    }

                    debugLog(`Retry delay initiated`, {
                        backoffDelay,
                        nextAttempt: attempt + 1,
                        remainingBudget,
                        elapsedTime: Date.now() - startTime
                    });

                    api.log("info", `Waiting ${backoffDelay}ms before retry attempt ${attempt + 1}`);
                    await sleep(backoffDelay);
                }
            }

            // All retries exhausted - return structured error
            const finalElapsed = Date.now() - startTime;
            const retryExhaustionError = ErrorCreators.retryExhausted(
                actualAttempts,
                lastError?.message || "Unknown error",
                finalElapsed,
                requestId
            );

            if (responseTarget && responseKey) {
                storeData(responseTarget, responseKey, retryExhaustionError);
            }

            api.log("error", `Request ${requestId}: All ${actualAttempts} attempts failed after ${finalElapsed}ms`);
            api.output("Request failed - retry attempts exhausted", retryExhaustionError);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during HTTP request";
            const errorResponse = createErrorResponse(
                "NetworkError",
                errorMessage,
                500,
                { originalError: errorMessage },
                requestId
            );

            api.log("error", `Request ${requestId}: ${errorMessage}`);

            // Store complete error response in configured target/key
            if (responseTarget && responseKey) {
                storeData(responseTarget, responseKey, errorResponse);
                api.log("info", `Request ${requestId}: Error response stored in ${responseTarget}.${responseKey}`);
            }

            // Output the error result
            api.output("Request failed", errorResponse);
        }
    }
});