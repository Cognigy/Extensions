/// <reference types="jest" />

import { CXoneError, createErrorMessage } from "../errors";

describe("errors", () => {
    describe("CXoneError", () => {
        it("should set all properties correctly when instantiated", () => {
            const error = new CXoneError("Component", "Action", "Message", { key: "value" });

            expect(error.component).toBe("Component");
            expect(error.action).toBe("Action");
            expect(error.message).toBe("Component: Action: Message");
            expect(error.name).toBe("CXoneError");
            expect(error.context).toEqual({ key: "value" });
        });

        it("should format error message correctly", () => {
            const error = new CXoneError("TokenManager", "encryptToken", "Failed to encrypt");

            expect(error.message).toBe("TokenManager: encryptToken: Failed to encrypt");
        });

        it("should set name property to 'CXoneError'", () => {
            const error = new CXoneError("Component", "Action", "Message");

            expect(error.name).toBe("CXoneError");
        });

        it("should work without optional context parameter", () => {
            const error = new CXoneError("Component", "Action", "Message");

            expect(error.component).toBe("Component");
            expect(error.action).toBe("Action");
            expect(error.message).toBe("Component: Action: Message");
            expect(error.context).toBeUndefined();
        });

        it("should be an instance of Error", () => {
            const error = new CXoneError("Component", "Action", "Message");

            expect(error).toBeInstanceOf(Error);
        });

        it("should be an instance of CXoneError", () => {
            const error = new CXoneError("Component", "Action", "Message");

            expect(error).toBeInstanceOf(CXoneError);
        });

        it("should preserve stack trace when Error.captureStackTrace is available", () => {
            const error = new CXoneError("Component", "Action", "Message");

            // Stack trace should exist (at least in Node.js environment)
            expect(error.stack).toBeDefined();
            expect(typeof error.stack).toBe("string");
            expect(error.stack!.length).toBeGreaterThan(0);
        });

        it("should handle empty strings in component, action, and message", () => {
            const error = new CXoneError("", "", "");

            expect(error.component).toBe("");
            expect(error.action).toBe("");
            expect(error.message).toBe(": : ");
        });

        it("should handle special characters in message", () => {
            const error = new CXoneError("Component", "Action", "Error: with: colons");

            expect(error.message).toBe("Component: Action: Error: with: colons");
        });

        it("should handle context with various data types", () => {
            const context = {
                string: "value",
                number: 123,
                boolean: true,
                null: null,
                array: [1, 2, 3],
                nested: { key: "value" }
            };
            const error = new CXoneError("Component", "Action", "Message", context);

            expect(error.context).toEqual(context);
        });
    });

    describe("createErrorMessage", () => {
        it("should format message correctly with component, action, and details", () => {
            const message = createErrorMessage("Component", "Action", "Details");

            expect(message).toBe("Component: Action: Details");
        });

        it("should handle various component/action/details combinations", () => {
            expect(createErrorMessage("TokenManager", "encryptToken", "Failed to encrypt")).toBe(
                "TokenManager: encryptToken: Failed to encrypt"
            );
            expect(createErrorMessage("ApiClient", "getToken", "Network error")).toBe(
                "ApiClient: getToken: Network error"
            );
            expect(createErrorMessage("Handler", "process", "Invalid input")).toBe(
                "Handler: process: Invalid input"
            );
        });

        it("should handle empty strings", () => {
            expect(createErrorMessage("", "", "")).toBe(": : ");
            expect(createErrorMessage("Component", "", "Details")).toBe("Component: : Details");
            expect(createErrorMessage("", "Action", "Details")).toBe(": Action: Details");
        });

        it("should handle special characters", () => {
            expect(createErrorMessage("Comp:onent", "Act:ion", "Det:ails")).toBe(
                "Comp:onent: Act:ion: Det:ails"
            );
            expect(createErrorMessage("Component", "Action", "Error: with: colons")).toBe(
                "Component: Action: Error: with: colons"
            );
        });

        it("should handle numbers as strings", () => {
            expect(createErrorMessage("Component1", "Action2", "Details3")).toBe(
                "Component1: Action2: Details3"
            );
        });

        it("should handle long strings", () => {
            const longString = "a".repeat(1000);
            const message = createErrorMessage("Component", "Action", longString);

            expect(message).toBe(`Component: Action: ${longString}`);
            expect(message.length).toBe(1019); // Component: Action:  + 1000 chars (19 + 1000)
        });
    });
});

