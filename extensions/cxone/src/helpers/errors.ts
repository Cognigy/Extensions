/**
 * Custom error classes for CXone Extension
 */

import { StandardizedError, StandardizedResponse, ErrorType } from "../types";

/**
 * Base CXone error class with context
 */
export class CXoneError extends Error {
    public readonly component: string;
    public readonly action: string;
    public readonly context?: Record<string, any>;

    constructor(
        component: string,
        action: string,
        message: string,
        context?: Record<string, any>
    ) {
        super(`${component}: ${action}: ${message}`);
        this.name = "CXoneError";
        this.component = component;
        this.action = action;
        this.context = context;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CXoneError);
        }
    }
}

/**
 * Create a standardized error message
 */
export function createErrorMessage(
    component: string,
    action: string,
    details: string
): string {
    return `${component}: ${action}: ${details}`;
}

/**
 * Generate a unique request ID for error tracking
 */
export function generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `req_${timestamp}_${random}`;
}

/**
 * Create a standardized error object
 */
export function createStandardizedError(
    type: ErrorType,
    message: string,
    status?: number,
    details?: Record<string, any>,
    requestId?: string
): StandardizedError {
    return {
        type,
        message,
        ...(status !== undefined && { status }),
        ...(details && { details }),
        ...(requestId && { requestId })
    };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
    type: ErrorType,
    message: string,
    status?: number,
    details?: Record<string, any>,
    requestId?: string
): StandardizedResponse {
    return {
        success: false,
        error: createStandardizedError(type, message, status, details, requestId)
    };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(data: any): StandardizedResponse {
    return {
        success: true,
        data
    };
}

/**
 * Predefined error creators for common scenarios
 */
export const ErrorCreators = {
    missingToken: (requestId?: string): StandardizedResponse =>
        createErrorResponse(
            "MissingToken",
            "Missing cxonetoken in input.data or context.cxonetoken. This node can only be used in flows invoked by CXone with authentication.",
            401,
            { tokenSources: ["input.data.cxonetoken", "context.cxonetoken"] },
            requestId
        ),

    invalidConfig: (message: string, details?: Record<string, any>, requestId?: string): StandardizedResponse =>
        createErrorResponse(
            "InvalidConfig",
            message,
            400,
            details,
            requestId
        ),

    timeout: (timeoutMs: number, requestId?: string): StandardizedResponse =>
        createErrorResponse(
            "Timeout",
            `Request timeout after ${timeoutMs}ms`,
            408,
            { timeoutMs, hardLimitMs: 20000, cognigyStandard: "20-second execution budget" },
            requestId
        ),

    networkError: (message: string, requestId?: string): StandardizedResponse =>
        createErrorResponse(
            "NetworkError",
            `Network error: ${message}`,
            503,
            { isRetryable: true },
            requestId
        ),

    httpError: (status: number, message: string, body?: any, requestId?: string): StandardizedResponse =>
        createErrorResponse(
            "HttpError",
            `HTTP ${status}: ${message}`,
            status,
            { responseBody: body, isRetryable: status >= 500 || status === 429 },
            requestId
        ),

    retryExhausted: (attempts: number, lastError: string, elapsedMs: number, requestId?: string): StandardizedResponse =>
        createErrorResponse(
            "RetryExhausted",
            `All ${attempts} attempts failed. Last error: ${lastError}`,
            500,
            { attempts, elapsedMs, lastError },
            requestId
        )
};

