/**
 * Custom error classes for CXone Extension
 */

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

