import { INodeFunctionBaseParams } from "@cognigy/extension-tools";

// Response/Error types (used by errors.ts)
export type ErrorType = "MissingToken" | "InvalidConfig" | "Timeout" | "NetworkError" | "HttpError" | "RetryExhausted";

export interface StandardizedError {
    type: ErrorType;
    message: string;
    status?: number;
    details?: Record<string, any>;
    requestId?: string;
}

export interface StandardizedResponse {
    success: boolean;
    error?: StandardizedError;
    data?: any;
}

// Authenticated-call types
export type ResponseTarget = "context" | "input";
export type PayloadType = "json" | "text" | "form";

export interface AuthenticatedCallNodeConfig {
    url: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers: Record<string, string>;

    // Legacy body field for backward compatibility
    body?: string;

    // Payload configuration (for non-GET/DELETE methods)
    payloadType?: PayloadType;
    bodyJson?: any;
    bodyText?: string;
    bodyForm?: Record<string, string>;

    // Execution configuration
    timeoutMs?: number;
    enableRetry?: boolean;
    retryAttempts?: number;

    // Error handling and debug configuration
    failOnNon2xx?: boolean;
    debugMode?: boolean;

    // Security configuration
    allowInsecureSSL?: boolean;

    responseTarget?: ResponseTarget;
    responseKey?: string;
    storeResponseHeaders?: boolean;
}

export interface AuthenticatedCallNodeParams extends INodeFunctionBaseParams {
    config: AuthenticatedCallNodeConfig;
}
