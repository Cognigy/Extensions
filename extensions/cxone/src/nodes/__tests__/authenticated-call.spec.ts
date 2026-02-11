/// <reference types="jest" />

import { cxoneAuthenticatedCall } from "../authenticated-call";
import { createMockCognigy } from "../../test-utils/mockCognigyApi";

// Mock fetch globally
global.fetch = jest.fn();

describe("cxoneAuthenticatedCall node", () => {
    let mockFetch: jest.MockedFunction<typeof fetch>;

    const baseConfig = {
        url: "https://api.example.com/test",
        method: "GET" as const,
        headers: {
            "Custom-Header": "test-value"
        },
        body: ""
    };

    beforeEach(() => {
        mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
        jest.clearAllMocks();
    });

    describe("successful requests", () => {
        it("should make a GET request with cxonetoken from input.data", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true, data: "test"
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token-123"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token-123"
                },
                signal: expect.any(AbortSignal)
            });

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request completed successfully",
                {
                    success: true,
                    data: {
                        status: 200,
                        body: { success: true, data: "test" }
                    }
                }
            );
        });

        it("should make a POST request with JSON body", async () => {
            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                body: { name: "test", value: 123 }
            };

            const mockResponse = {
                status: 201,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ id: 456
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token-456"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token-456"
                },
                body: '{"name":"test","value":123}',
                signal: expect.any(AbortSignal)
            });

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request completed successfully",
                {
                    success: true,
                    data: {
                        status: 201,
                        body: { id: 456 }
                    }
                }
            );
        });

        it("should handle text responses", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "text/plain"]]),
                text: jest.fn().mockResolvedValue("Plain text response")
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token-789"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request completed successfully",
                {
                    success: true,
                    data: {
                        status: 200,
                        body: "Plain text response"
                    }
                }
            );
        });

        it("should override user-provided Authorization header", async () => {
            const configWithAuth = {
                ...baseConfig,
                headers: {
                    "Authorization": "Bearer user-provided-token",
                    "Custom-Header": "test-value"
                }
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "correct-token"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithAuth as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer correct-token" // Should be the cxonetoken, not user-provided
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle string body for POST request", async () => {
            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                body: "raw string body"
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ received: "ok"
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token"
                },
                body: "raw string body",
                signal: expect.any(AbortSignal)
            });
        });
    });

    describe("error handling", () => {
        it("should return structured error when cxonetoken is missing from both input and context", async () => {
            const cognigy = createMockCognigy({
                input: {
                    data: {} // No cxonetoken
                },
                context: {} // No cxonetoken in context either
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Authentication Error",
                {
                    success: false,
                    error: {
                        type: "MissingToken",
                        message: "Missing cxonetoken in input.data or context.cxonetoken. This node can only be used in flows invoked by CXone with authentication.",
                        status: 401,
                        details: {
                            tokenSources: ["input.data.cxonetoken", "context.cxonetoken"]
                        },
                        requestId: expect.any(String)
                    }
                }
            );
            expect(cognigy.api.log).toHaveBeenCalledWith(
                "error",
                expect.stringMatching(/Request req_[a-z0-9_]+: Missing cxonetoken/)
            );
        });

        it("should return structured error when cxonetoken is undefined in both locations", async () => {
            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: undefined
                    }
                },
                context: {
                    cxonetoken: undefined
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Authentication Error",
                {
                    success: false,
                    error: {
                        type: "MissingToken",
                        message: "Missing cxonetoken in input.data or context.cxonetoken. This node can only be used in flows invoked by CXone with authentication.",
                        status: 401,
                        details: {
                            tokenSources: ["input.data.cxonetoken", "context.cxonetoken"]
                        },
                        requestId: expect.any(String)
                    }
                }
            );
        });

        it("should handle fetch errors gracefully", async () => {
            mockFetch.mockRejectedValue(new Error("Network error"));

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(cognigy.api.log).toHaveBeenCalledWith(
                "error",
                expect.stringMatching(/Request req_[a-z0-9_]+: Network error: Network error/)
            );

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request failed",
                {
                    success: false,
                    error: {
                        type: "NetworkError",
                        message: "Network error: Network error",
                        status: 503,
                        details: {
                            isRetryable: true
                        },
                        requestId: expect.any(String)
                    }
                }
            );
        });

        it("should handle response parsing errors", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockRejectedValue(new Error("Invalid JSON"))
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request failed",
                {
                    success: false,
                    error: {
                        type: "NetworkError",
                        message: "Network error: Invalid JSON",
                        status: 503,
                        details: {
                            isRetryable: true
                        },
                        requestId: expect.any(String)
                    }
                }
            );
        });
    });

    describe("context.cxonetoken fallback", () => {
        it("should use token from context when input.data.cxonetoken is missing", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {} // No cxonetoken in input.data
                },
                context: {
                    cxonetoken: "context-token-123"
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer context-token-123"
                },
                signal: expect.any(AbortSignal)
            });

            expect(cognigy.api.log).toHaveBeenCalledWith(
                "info",
                expect.stringMatching(/Request req_[a-z0-9_]+: Using cxonetoken from context/)
            );

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request completed successfully",
                {
                    success: true,
                    data: {
                        status: 200,
                        body: { success: true }
                    }
                }
            );
        });

        it("should prioritize input.data.cxonetoken over context.cxonetoken", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "input-token-priority"
                    }
                },
                context: {
                    cxonetoken: "context-token-fallback"
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer input-token-priority"
                },
                signal: expect.any(AbortSignal)
            });

            expect(cognigy.api.log).toHaveBeenCalledWith(
                "info",
                expect.stringMatching(/Request req_[a-z0-9_]+: Using cxonetoken from input.data/)
            );
        });

        it("should handle empty input.data and use context token", async () => {
            const mockResponse = {
                status: 201,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ created: true
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                body: { test: "data" }
            };

            const cognigy = createMockCognigy({
                input: {
                    data: null // Null input.data
                },
                context: {
                    cxonetoken: "context-fallback-token"
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer context-fallback-token"
                },
                body: '{"test":"data"}',
                signal: expect.any(AbortSignal)
            });

            expect(cognigy.api.log).toHaveBeenCalledWith(
                "info",
                expect.stringMatching(/Request req_[a-z0-9_]+: Using cxonetoken from context/)
            );
        });
    });

    describe("HTTP methods without body", () => {
        it("should not include body for GET request even if provided", async () => {
            const getConfigWithBody = {
                ...baseConfig,
                method: "GET" as const,
                body: { shouldNotBeIncluded: true }
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: getConfigWithBody as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token"
                },
                signal: expect.any(AbortSignal)
                // No body should be present
            });
        });

        it("should not include body for DELETE request", async () => {
            const deleteConfig = {
                ...baseConfig,
                method: "DELETE" as const,
                body: { shouldNotBeIncluded: true }
            };

            const mockResponse = {
                status: 204,
                ok: true,
                headers: new Map(),
                text: jest.fn().mockResolvedValue("")
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: deleteConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token"
                },
                signal: expect.any(AbortSignal)
                // No body should be present
            });
        });
    });

    describe("logging", () => {
        it("should log request details and completion", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(cognigy.api.log).toHaveBeenCalledWith(
                "info",
                expect.stringMatching(/Request req_[a-z0-9_]+: Making GET request to: https:\/\/api\.example\.com\/test/)
            );
            expect(cognigy.api.log).toHaveBeenCalledWith(
                "info",
                expect.stringMatching(/Executing GET request with timeout: \d+ms, max attempts: \d+/)
            );
            expect(cognigy.api.log).toHaveBeenCalledWith(
                "info",
                expect.stringMatching(/Request req_[a-z0-9_]+: Completed with status 200 \(attempt \d+\/\d+\)/)
            );
        });
    });

    describe("response handling and storage", () => {
        const mockResponseWithHeaders = {
            status: 200,
            ok: true,
            headers: new Map([
                ["content-type", "application/json"],
                ["x-custom-header", "custom-value"],
                ["server", "nginx/1.18.0"]
            ]),
            json: jest.fn().mockResolvedValue({ success: true, data: "test" })
        };

        beforeEach(() => {
            mockResponseWithHeaders.headers.forEach = jest.fn((callback) => {
                callback("application/json", "content-type", mockResponseWithHeaders.headers);
                callback("custom-value", "x-custom-header", mockResponseWithHeaders.headers);
                callback("nginx/1.18.0", "server", mockResponseWithHeaders.headers);
            });
        });

        it("should store response body in default context location", async () => {
            mockFetch.mockResolvedValue(mockResponseWithHeaders as any);

            const configWithDefaults = {
                ...baseConfig,
                responseTarget: "context",
                responseKey: "cxone.lastResponse"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithDefaults as any
            } as any);

            // Should store complete response object at specified key
            expect(cognigy.api.addToContext).toHaveBeenCalledWith(
                "cxone.lastResponse",
                {
                    success: true,
                    data: {
                        status: 200,
                        body: { success: true, data: "test" }
                    }
                },
                "simple"
            );
        });

        it("should store response headers when enabled", async () => {
            mockFetch.mockResolvedValue(mockResponseWithHeaders as any);

            const configWithHeaders = {
                ...baseConfig,
                responseTarget: "context",
                responseKey: "cxone.apiCall",
                storeResponseHeaders: true
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithHeaders as any
            } as any);

            // Should store complete response object including headers
            expect(cognigy.api.addToContext).toHaveBeenCalledWith(
                "cxone.apiCall",
                {
                    success: true,
                    data: {
                        status: 200,
                        body: { success: true, data: "test" },
                        headers: {
                            "content-type": "application/json",
                            "x-custom-header": "custom-value",
                            "server": "nginx/1.18.0"
                        }
                    }
                },
                "simple"
            );
        });

        it("should store response in input target", async () => {
            mockFetch.mockResolvedValue(mockResponseWithHeaders as any);

            const configWithInput = {
                ...baseConfig,
                responseTarget: "input",
                responseKey: "api.lastCall"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithInput as any
            } as any);

            // Should store complete response object in input with specified key
            expect(cognigy.input["api.lastCall"]).toEqual({
                success: true,
                data: {
                    status: 200,
                    body: { success: true, data: "test" }
                }
            });
        });


        it("should handle error responses with new storage configuration", async () => {
            mockFetch.mockRejectedValue(new Error("Network timeout"));

            const configWithStorage = {
                ...baseConfig,
                responseTarget: "context",
                responseKey: "cxone.errorResponse"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithStorage as any
            } as any);

            // Should store complete error response in configured location
            expect(cognigy.api.addToContext).toHaveBeenCalledWith(
                "cxone.errorResponse",
                {
                    success: false,
                    error: {
                        type: "NetworkError",
                        message: "Network error: Network timeout",
                        status: 503,
                        details: {
                            isRetryable: true
                        },
                        requestId: expect.any(String)
                    }
                },
                "simple"
            );

        });

        it("should not store headers when storeResponseHeaders is false", async () => {
            mockFetch.mockResolvedValue(mockResponseWithHeaders as any);

            const configWithoutHeaders = {
                ...baseConfig,
                responseTarget: "context",
                responseKey: "cxone.response",
                storeResponseHeaders: false
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithoutHeaders as any
            } as any);

            // Should store complete response object without headers
            expect(cognigy.api.addToContext).toHaveBeenCalledWith(
                "cxone.response",
                {
                    success: true,
                    data: {
                        status: 200,
                        body: { success: true, data: "test" }
                    }
                },
                "simple"
            );

            // Should NOT include headers in the response object
            expect(cognigy.api.addToContext).toHaveBeenCalledTimes(1); // Only one call for the main response
            const storedResponse = (cognigy.api.addToContext as jest.Mock).mock.calls[0][1];
            expect(storedResponse.data.headers).toBeUndefined();
        });

        it("should handle missing responsePath gracefully", async () => {
            mockFetch.mockResolvedValue(mockResponseWithHeaders as any);

            const configWithoutPath = {
                ...baseConfig,
                responseTarget: "context",
                responseKey: ""
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithoutPath as any
            } as any);


            // Should output normally
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request completed successfully",
                {
                    success: true,
                    data: {
                        status: 200,
                        body: { success: true, data: "test" }
                    }
                }
            );
        });
    });

    describe("new payload type functionality", () => {
        it("should handle JSON payload type correctly", async () => {
            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                payloadType: "json" as const,
                bodyJson: { name: "test", value: 123 }
            };

            const mockResponse = {
                status: 201,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ id: 456
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token-456"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token-456"
                },
                body: '{"name":"test","value":123}',
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle text payload type correctly", async () => {
            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                payloadType: "text" as const,
                bodyText: "plain text body"
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "text/plain"]]),
                text: jest.fn().mockResolvedValue("ok")
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token"
                },
                body: "plain text body",
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle form data payload type correctly", async () => {
            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                payloadType: "form" as const,
                bodyForm: { username: "testuser", password: "secret123" }
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: {
                        cxonetoken: "test-token"
                    }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token"
                },
                body: "username=testuser&password=secret123",
                signal: expect.any(AbortSignal)
            });
        });

        it("should store response using simple key format in context", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ result: "success"
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const configSimpleKey = {
                ...baseConfig,
                responseTarget: "context",
                responseKey: "myApiResult"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configSimpleKey as any
            } as any);

            // Should store complete response object using the simple key
            expect(cognigy.api.addToContext).toHaveBeenCalledWith(
                "myApiResult",
                {
                    success: true,
                    data: {
                        status: 200,
                        body: { result: "success" }
                    }
                },
                "simple"
            );
        });

        it("should store response using simple key format in input", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ result: "success"
            })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const configInputKey = {
                ...baseConfig,
                responseTarget: "input",
                responseKey: "myApiResult"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configInputKey as any
            } as any);

            // Should store complete response object in input with the key
            expect(cognigy.input.myApiResult).toEqual({
                success: true,
                data: {
                    status: 200,
                    body: { result: "success" }
                }
            });
        });
    });

    // ========== PHASE 1: UNIT TESTS ENHANCEMENT ==========

    describe("validation errors", () => {
        it("should handle malformed JSON in headers field", async () => {
            const configWithInvalidHeaders = {
                ...baseConfig,
                headers: "{ invalid json }"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithInvalidHeaders as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Configuration Error",
                {
                    success: false,
                    error: {
                        type: "InvalidConfig",
                        message: "Invalid headers format - must be valid JSON",
                        status: 400,
                        details: expect.objectContaining({
                            headers: "{ invalid json }",
                            headerError: expect.any(String)
                        }),
                        requestId: expect.any(String)
                    }
                }
            );
        });

        it("should handle malformed JSON in bodyJson field", async () => {
            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                payloadType: "json" as const,
                bodyJson: "{ malformed json }"
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            // Should handle the malformed JSON gracefully by treating it as a string
            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token"
                },
                body: "{ malformed json }",
                signal: expect.any(AbortSignal)
            });
        });

        it("should reject invalid URL formats", async () => {
            const configWithInvalidUrl = {
                ...baseConfig,
                url: "not-a-valid-url"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithInvalidUrl as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Configuration Error",
                {
                    success: false,
                    error: {
                        type: "InvalidConfig",
                        message: expect.stringMatching(/Invalid URL format: not-a-valid-url/),
                        status: 400,
                        details: expect.objectContaining({
                            url: "not-a-valid-url",
                            urlError: expect.any(String)
                        }),
                        requestId: expect.any(String)
                    }
                }
            );
        });

        it("should handle empty/null headers configuration", async () => {
            const configWithNullHeaders = {
                ...baseConfig,
                headers: null
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithNullHeaders as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer test-token"
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle header normalization from string to object", async () => {
            const configWithStringHeaders = {
                ...baseConfig,
                headers: '{"X-Custom": "value", "Accept": "application/json"}'
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithStringHeaders as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Custom": "value",
                    "Accept": "application/json",
                    "Authorization": "Bearer test-token"
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle empty URL gracefully", async () => {
            const configWithEmptyUrl = {
                ...baseConfig,
                url: ""
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithEmptyUrl as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Configuration Error",
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        type: "InvalidConfig",
                        message: expect.stringMatching(/Invalid URL format: /)
                    })
                })
            );
        });

        it("should handle undefined configuration gracefully", async () => {
            const configWithUndefinedFields = {
                url: "https://api.example.com/test",
                method: "GET" as const,
                headers: undefined,
                body: undefined
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithUndefinedFields as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer test-token"
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle relative URL formats", async () => {
            const configWithRelativeUrl = {
                ...baseConfig,
                url: "/api/test"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithRelativeUrl as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Configuration Error",
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        type: "InvalidConfig",
                        message: expect.stringMatching(/Invalid URL format: \/api\/test/)
                    })
                })
            );
        });

        it("should handle protocol-less URLs", async () => {
            const configWithProtocolLessUrl = {
                ...baseConfig,
                url: "api.example.com/test"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithProtocolLessUrl as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Configuration Error",
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        type: "InvalidConfig",
                        message: expect.stringMatching(/Invalid URL format: api.example.com\/test/)
                    })
                })
            );
        });

        it("should handle malformed JSON with syntax errors", async () => {
            const configWithSyntaxError = {
                ...baseConfig,
                headers: '{"key": value without quotes}'
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithSyntaxError as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Configuration Error",
                {
                    success: false,
                    error: {
                        type: "InvalidConfig",
                        message: "Invalid headers format - must be valid JSON",
                        status: 400,
                        details: expect.objectContaining({
                            headers: '{"key": value without quotes}',
                            headerError: expect.any(String)
                        }),
                        requestId: expect.any(String)
                    }
                }
            );
        });

        it("should validate complex nested headers JSON", async () => {
            const configWithComplexHeaders = {
                ...baseConfig,
                headers: '{"Authorization": "Bearer existing", "Custom": {"nested": "value"}}'
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithComplexHeaders as any
            } as any);

            // Complex headers are accepted and processed
            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer test-token",
                    "Custom": { "nested": "value" }
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle incomplete JSON objects", async () => {
            const configWithIncompleteJson = {
                ...baseConfig,
                headers: '{"key": "value", "incomplete"'
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithIncompleteJson as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Configuration Error",
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        type: "InvalidConfig",
                        message: "Invalid headers format - must be valid JSON"
                    })
                })
            );
        });

        it("should handle URL with special characters", async () => {
            const configWithSpecialChars = {
                ...baseConfig,
                url: "https://api.example.com/test?param=value%20with%20spaces&other=<script>"
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithSpecialChars as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/test?param=value%20with%20spaces&other=<script>",
                expect.objectContaining({
                    method: "GET",
                    headers: expect.objectContaining({
                        "Authorization": "Bearer test-token"
                    })
                })
            );
        });

        it("should handle very long URLs", async () => {
            const longPath = "a".repeat(2000);
            const configWithLongUrl = {
                ...baseConfig,
                url: `https://api.example.com/${longPath}`
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithLongUrl as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith(
                `https://api.example.com/${longPath}`,
                expect.objectContaining({
                    method: "GET"
                })
            );
        });

        it("should handle arrays in headers JSON", async () => {
            const configWithArrayHeaders = {
                ...baseConfig,
                headers: '{"Custom-Header": ["value1", "value2"]}'
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithArrayHeaders as any
            } as any);

            // Arrays in headers are accepted and processed
            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer test-token",
                    "Custom-Header": ["value1", "value2"]
                },
                signal: expect.any(AbortSignal)
            });
        });
    });

    describe("error classification mapping", () => {
        it("should create correct MissingToken error structure", async () => {
            const cognigy = createMockCognigy({
                input: { data: {} },
                context: {}
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Authentication Error",
                {
                    success: false,
                    error: {
                        type: "MissingToken",
                        message: "Missing cxonetoken in input.data or context.cxonetoken. This node can only be used in flows invoked by CXone with authentication.",
                        status: 401,
                        details: {
                            tokenSources: ["input.data.cxonetoken", "context.cxonetoken"]
                        },
                        requestId: expect.any(String)
                    }
                }
            );
        });

        it("should create correct InvalidConfig error structure", async () => {
            const configWithInvalidUrl = {
                ...baseConfig,
                url: "invalid-url"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithInvalidUrl as any
            } as any);

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Configuration Error",
                {
                    success: false,
                    error: {
                        type: "InvalidConfig",
                        message: expect.stringMatching(/Invalid URL format: invalid-url/),
                        status: 400,
                        details: expect.objectContaining({
                            url: "invalid-url",
                            urlError: expect.any(String)
                        }),
                        requestId: expect.any(String)
                    }
                }
            );
        });

        it("should create correct NetworkError error structure", async () => {
            mockFetch.mockRejectedValue(new Error("Connection refused"));

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request failed",
                {
                    success: false,
                    error: {
                        type: "NetworkError",
                        message: "Network error: Connection refused",
                        status: 503,
                        details: {
                            isRetryable: true
                        },
                        requestId: expect.any(String)
                    }
                }
            );
        });

        it("should create correct Timeout error structure", async () => {
            // Mock a timeout by using AbortController
            mockFetch.mockImplementation(() => {
                const error = new Error("Request timeout after 8000ms");
                error.name = "TimeoutError";
                return Promise.reject(error);
            });

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request failed",
                {
                    success: false,
                    error: {
                        type: "Timeout",
                        message: "Request timeout after 8000ms",
                        status: 408,
                        details: {
                            timeoutMs: 8000,
                            hardLimitMs: 20000,
                            cognigyStandard: "20-second execution budget"
                        },
                        requestId: expect.any(String)
                    }
                }
            );
        });

        it("should create correct HttpError error structure", async () => {
            const mockResponse = {
                status: 404,
                ok: false,
                statusText: "Not Found",
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ error: "Resource not found" })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: { ...baseConfig, failOnNon2xx: true } as any
            } as any);

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "HTTP 404 Error",
                {
                    success: false,
                    error: {
                        type: "HttpError",
                        message: "HTTP 404: Not Found",
                        status: 404,
                        details: {
                            responseBody: { error: "Resource not found" },
                            isRetryable: false
                        },
                        requestId: expect.any(String)
                    }
                }
            );
        });

        it("should create correct error structure on final retry attempt", async () => {
            let callCount = 0;

            // Mock setTimeout to avoid actual delays in tests
            const originalSetTimeout = global.setTimeout;
            global.setTimeout = jest.fn((callback: Function) => {
                callback();
                return {} as any;
            }) as any;

            mockFetch.mockImplementation(() => {
                callCount++;
                return Promise.reject(new Error("Connection timeout"));
            });

            const configWithRetry = {
                ...baseConfig,
                enableRetry: true,
                retryAttempts: 2
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithRetry as any
            } as any);

            // Should make 3 attempts total (1 initial + 2 retries)
            expect(callCount).toBe(3);

            // On final attempt, should exit with NetworkError (not RetryExhausted)
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request failed",
                {
                    success: false,
                    error: {
                        type: "NetworkError",
                        message: "Network error: Connection timeout",
                        status: 503,
                        details: {
                            isRetryable: true
                        },
                        requestId: expect.any(String)
                    }
                }
            );

            // Restore setTimeout
            global.setTimeout = originalSetTimeout;
        });

        it("should correctly classify retryable vs non-retryable errors", async () => {
            const retryableStatuses = [429, 500, 502, 503];
            const nonRetryableStatuses = [400, 401, 403, 404, 422];

            for (const status of retryableStatuses) {
                const mockResponse = {
                    status,
                    ok: false,
                    statusText: `Status ${status}`,
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ error: `Error ${status}` })
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: { ...baseConfig, failOnNon2xx: true } as any
                } as any);

                expect(cognigy.api.output).toHaveBeenCalledWith(
                    `HTTP ${status} Error`,
                    expect.objectContaining({
                        success: false,
                        error: expect.objectContaining({
                            type: "HttpError",
                            details: expect.objectContaining({
                                isRetryable: true
                            })
                        })
                    })
                );

                jest.clearAllMocks();
            }

            for (const status of nonRetryableStatuses) {
                const mockResponse = {
                    status,
                    ok: false,
                    statusText: `Status ${status}`,
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ error: `Error ${status}` })
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: { ...baseConfig, failOnNon2xx: true } as any
                } as any);

                expect(cognigy.api.output).toHaveBeenCalledWith(
                    `HTTP ${status} Error`,
                    expect.objectContaining({
                        success: false,
                        error: expect.objectContaining({
                            type: "HttpError",
                            details: expect.objectContaining({
                                isRetryable: false
                            })
                        })
                    })
                );

                jest.clearAllMocks();
            }
        });

        it("should include requestId in all error structures", async () => {
            const testCases = [
                {
                    name: "MissingToken",
                    setup: () => createMockCognigy({ input: { data: {} }, context: {} }),
                    config: baseConfig
                },
                {
                    name: "InvalidConfig",
                    setup: () => createMockCognigy({ input: { data: { cxonetoken: "test-token" } } }),
                    config: { ...baseConfig, url: "invalid-url" }
                }
            ];

            for (const testCase of testCases) {
                const cognigy = testCase.setup();

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: testCase.config as any
                } as any);

                const outputCall = cognigy.api.output.mock.calls[0];
                expect(outputCall[1]).toEqual(
                    expect.objectContaining({
                        success: false,
                        error: expect.objectContaining({
                            requestId: expect.stringMatching(/^req_[a-z0-9_]+$/)
                        })
                    })
                );

                jest.clearAllMocks();
            }
        });

        it("should validate error response format consistency", async () => {
            const cognigy = createMockCognigy({
                input: { data: {} },
                context: {}
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            const outputCall = cognigy.api.output.mock.calls[0];
            const errorResponse = outputCall[1];

            // Validate structure
            expect(errorResponse).toEqual(
                expect.objectContaining({
                    success: expect.any(Boolean),
                    error: expect.objectContaining({
                        type: expect.any(String),
                        message: expect.any(String),
                        status: expect.any(Number),
                        details: expect.any(Object),
                        requestId: expect.any(String)
                    })
                })
            );

            expect(errorResponse.success).toBe(false);
            expect(errorResponse.data).toBeUndefined();
        });

        it("should handle error details object variations", async () => {
            mockFetch.mockRejectedValue(new Error("Network failure"));

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            const outputCall = cognigy.api.output.mock.calls[0];
            const errorResponse = outputCall[1];

            expect(errorResponse.error.details).toEqual(
                expect.objectContaining({
                    isRetryable: true
                })
            );
        });

        it("should maintain error message format consistency", async () => {
            const errorTestCases = [
                {
                    name: "Network error format",
                    mockError: () => mockFetch.mockRejectedValue(new Error("DNS resolution failed")),
                    expectedPattern: /^Network error: DNS resolution failed$/
                },
                {
                    name: "HTTP error format",
                    mockError: () => {
                        const mockResponse = {
                            status: 500,
                            ok: false,
                            statusText: "Internal Server Error",
                            headers: new Map([["content-type", "application/json"]]),
                            json: jest.fn().mockResolvedValue({ error: "Server crashed" })
                        };
                        mockFetch.mockResolvedValue(mockResponse as any);
                    },
                    expectedPattern: /^HTTP 500: Internal Server Error$/
                }
            ];

            for (const testCase of errorTestCases) {
                testCase.mockError();

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: { ...baseConfig, failOnNon2xx: true } as any
                } as any);

                const outputCall = cognigy.api.output.mock.calls[0];
                expect(outputCall[1].error.message).toMatch(testCase.expectedPattern);

                jest.clearAllMocks();
            }
        });
    });

    describe("token edge cases", () => {
        it("should handle empty string token as missing", async () => {
            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "" }
                },
                context: {}
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Authentication Error",
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        type: "MissingToken"
                    })
                })
            );
        });

        it("should handle whitespace-only tokens as valid", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "   " }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer    "
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle null token values", async () => {
            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: null }
                },
                context: { cxonetoken: null }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Authentication Error",
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        type: "MissingToken"
                    })
                })
            );
        });

        it("should handle undefined token values", async () => {
            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: undefined }
                },
                context: { cxonetoken: undefined }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Authentication Error",
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        type: "MissingToken"
                    })
                })
            );
        });

        it("should handle tokens with special characters", async () => {
            const specialToken = "token.with-special_chars@123+/=";

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: specialToken }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": `Bearer ${specialToken}`
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should override Authorization header regardless of case", async () => {
            const testCases = [
                "authorization",
                "Authorization",
                "AUTHORIZATION",
                "AuThOrIzAtIoN"
            ];

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            for (const headerCase of testCases) {
                mockFetch.mockResolvedValue(mockResponse as any);

                const configWithAuthHeader = {
                    ...baseConfig,
                    headers: {
                        [headerCase]: "Bearer user-provided-token",
                        "Custom-Header": "test-value"
                    }
                };

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "correct-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithAuthHeader as any
                } as any);

                expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Custom-Header": "test-value",
                        [headerCase]: "Bearer user-provided-token",
                        "Authorization": "Bearer correct-token" // Should be overridden
                    },
                    signal: expect.any(AbortSignal)
                });

                jest.clearAllMocks();
            }
        });

        it("should handle very long tokens", async () => {
            const longToken = "a".repeat(5000);

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: longToken }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": `Bearer ${longToken}`
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle numeric token values", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: 123456789 }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer 123456789"
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle boolean token values", async () => {
            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: false }
                },
                context: {}
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).not.toHaveBeenCalled();
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Authentication Error",
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        type: "MissingToken"
                    })
                })
            );
        });

        it("should handle object token values", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: { token: "value" } }
                },
                context: {}
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            // Object tokens are converted to string representation
            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer [object Object]"
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should fall back to context token when input token is falsy", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "" } // Empty string is falsy
                },
                context: { cxonetoken: "context-fallback-token" }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            // Should use context token when input token is falsy
            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer context-fallback-token"
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle Unicode characters in tokens", async () => {
            const unicodeToken = "token-with-unicode-😀🚀🔥";

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: unicodeToken }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": `Bearer ${unicodeToken}`
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle array token values", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: ["token1", "token2"] }
                },
                context: {}
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            // Array tokens are converted to string representation
            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer token1,token2"
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle context token when input.data is null", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: null
                },
                context: { cxonetoken: "context-fallback-token" }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: baseConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer context-fallback-token"
                },
                signal: expect.any(AbortSignal)
            });

            expect(cognigy.api.log).toHaveBeenCalledWith(
                "info",
                expect.stringMatching(/Request req_[a-z0-9_]+: Using cxonetoken from context/)
            );
        });
    });

    describe("request config normalization", () => {
        it("should convert headers string to object correctly", async () => {
            const configWithStringHeaders = {
                ...baseConfig,
                headers: '{"Content-Type": "application/xml", "Accept": "application/json"}'
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithStringHeaders as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/xml", // User-provided Content-Type overrides default
                    "Accept": "application/json",
                    "Authorization": "Bearer test-token"
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should inject Content-Type header for JSON payloads", async () => {
            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                payloadType: "json" as const,
                bodyJson: { test: "data" },
                headers: {} // No Content-Type specified
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer test-token"
                },
                body: '{"test":"data"}',
                signal: expect.any(AbortSignal)
            });
        });

        it("should inject Content-Type header for text payloads", async () => {
            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                payloadType: "text" as const,
                bodyText: "plain text data",
                headers: {}
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "text/plain"]]),
                text: jest.fn().mockResolvedValue("ok")
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain",
                    "Authorization": "Bearer test-token"
                },
                body: "plain text data",
                signal: expect.any(AbortSignal)
            });
        });

        it("should inject Content-Type header for form payloads", async () => {
            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                payloadType: "form" as const,
                bodyForm: { key1: "value1", key2: "value2" },
                headers: {}
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Bearer test-token"
                },
                body: "key1=value1&key2=value2",
                signal: expect.any(AbortSignal)
            });
        });

        it("should validate HTTP method normalization", async () => {
            const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

            for (const method of validMethods) {
                const methodConfig = {
                    ...baseConfig,
                    method: method as any
                };

                const mockResponse = {
                    status: 200,
                    ok: true,
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ success: true })
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: methodConfig as any
                } as any);

                expect(mockFetch).toHaveBeenCalledWith(
                    "https://api.example.com/test",
                    expect.objectContaining({
                        method: method
                    })
                );

                jest.clearAllMocks();
            }
        });

        it("should handle URL protocol normalization", async () => {
            const urlTestCases = [
                {
                    input: "https://api.example.com/test",
                    expected: "https://api.example.com/test"
                },
                {
                    input: "http://api.example.com/test",
                    expected: "http://api.example.com/test"
                }
            ];

            for (const testCase of urlTestCases) {
                const urlConfig = {
                    ...baseConfig,
                    url: testCase.input
                };

                const mockResponse = {
                    status: 200,
                    ok: true,
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ success: true })
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: urlConfig as any
                } as any);

                expect(mockFetch).toHaveBeenCalledWith(
                    testCase.expected,
                    expect.any(Object)
                );

                jest.clearAllMocks();
            }
        });

        it("should handle configuration validation edge cases", async () => {
            const edgeCaseConfigs = [
                {
                    name: "missing headers",
                    config: { ...baseConfig, headers: undefined }
                },
                {
                    name: "empty headers object",
                    config: { ...baseConfig, headers: {} }
                },
                {
                    name: "null payload type",
                    config: { ...baseConfig, payloadType: null }
                }
            ];

            for (const testCase of edgeCaseConfigs) {
                const mockResponse = {
                    status: 200,
                    ok: true,
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ success: true })
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: testCase.config as any
                } as any);

                expect(mockFetch).toHaveBeenCalledWith(
                    "https://api.example.com/test",
                    expect.objectContaining({
                        method: "GET",
                        headers: expect.objectContaining({
                            "Authorization": "Bearer test-token"
                        })
                    })
                );

                jest.clearAllMocks();
            }
        });

        it("should handle mixed case header keys normalization", async () => {
            const configWithMixedCaseHeaders = {
                ...baseConfig,
                headers: {
                    "content-type": "application/xml", // lowercase
                    "Authorization": "Bearer should-be-overridden", // proper case
                    "X-CUSTOM-HEADER": "test-value", // uppercase
                    "accept-ENCODING": "gzip" // mixed case
                }
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "correct-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithMixedCaseHeaders as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json", // Should be overridden
                    "content-type": "application/xml",
                    "Authorization": "Bearer correct-token", // Should be overridden with correct token
                    "X-CUSTOM-HEADER": "test-value",
                    "accept-ENCODING": "gzip"
                },
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle legacy body field fallback", async () => {
            const legacyConfig = {
                ...baseConfig,
                method: "POST" as const,
                body: { legacy: "data" }, // Using legacy body field
                payloadType: undefined, // No new payload type
                bodyJson: undefined,
                bodyText: undefined,
                bodyForm: undefined
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: legacyConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token"
                },
                body: '{"legacy":"data"}',
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle body exclusion for GET and DELETE methods", async () => {
            const methodsWithoutBody = ["GET", "DELETE"];

            for (const method of methodsWithoutBody) {
                const configWithBody = {
                    ...baseConfig,
                    method: method as any,
                    payloadType: "json" as const,
                    bodyJson: { shouldNotBeIncluded: true }
                };

                const mockResponse = {
                    status: 200,
                    ok: true,
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ success: true })
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithBody as any
                } as any);

                const fetchCall = mockFetch.mock.calls[0];
                expect(fetchCall[1]).not.toHaveProperty("body");

                jest.clearAllMocks();
            }
        });

        it("should handle complex form data normalization", async () => {
            const complexFormData = {
                "field with spaces": "value with spaces",
                "special&chars": "value&with&ampersands",
                "unicode🚀": "value🔥",
                "number": 123,
                "boolean": true,
                "null": null,
                "undefined": undefined
            };

            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                payloadType: "form" as const,
                bodyForm: complexFormData
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            const fetchCall = mockFetch.mock.calls[0];
            const body = fetchCall[1].body;

            // Check that form data is properly encoded
            expect(body).toContain("field+with+spaces=value+with+spaces");
            expect(body).toContain("special%26chars=value%26with%26ampersands");
            expect(body).toContain("unicode%F0%9F%9A%80=value%F0%9F%94%A5");
            expect(body).toContain("number=123");
            expect(body).toContain("boolean=true");
            expect(body).toContain("null=null");
            expect(body).toContain("undefined=undefined");
        });

        it("should handle legacy body field fallback", async () => {
            const configWithLegacyBody = {
                ...baseConfig,
                method: "POST" as const,
                body: { test: "data" },
                // No payloadType specified, should use legacy body field
                bodyJson: undefined,
                bodyText: undefined,
                bodyForm: undefined
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithLegacyBody as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token"
                },
                body: '{"test":"data"}',
                signal: expect.any(AbortSignal)
            });
        });

        it("should handle string form data normalization", async () => {
            const postConfig = {
                ...baseConfig,
                method: "POST" as const,
                payloadType: "form" as const,
                bodyForm: "already-encoded-string"
            };

            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: postConfig as any
            } as any);

            expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Custom-Header": "test-value",
                    "Authorization": "Bearer test-token"
                },
                body: "already-encoded-string",
                signal: expect.any(AbortSignal)
            });
        });
    });

    // ========== PHASE 2: INTEGRATION TESTS ENHANCEMENT ==========

    describe("non-2xx response behavior", () => {
        describe("with failOnNon2xx=true", () => {
            const nonSuccessStatuses = [400, 401, 403, 404, 422, 429, 500, 502, 503];

            nonSuccessStatuses.forEach(status => {
                it(`should treat ${status} as error`, async () => {
                    const mockResponse = {
                        status,
                        ok: false,
                        statusText: `Status ${status}`,
                        headers: new Map([["content-type", "application/json"]]),
                        json: jest.fn().mockResolvedValue({ error: `Error ${status}` })
                    };

                    mockFetch.mockResolvedValue(mockResponse as any);

                    const cognigy = createMockCognigy({
                        input: {
                            data: { cxonetoken: "test-token" }
                        }
                    });

                    await cxoneAuthenticatedCall.function({
                        cognigy,
                        config: { ...baseConfig, failOnNon2xx: true } as any
                    } as any);

                    expect(cognigy.api.output).toHaveBeenCalledWith(
                        `HTTP ${status} Error`,
                        {
                            success: false,
                            error: {
                                type: "HttpError",
                                message: `HTTP ${status}: Status ${status}`,
                                status,
                                details: {
                                    responseBody: { error: `Error ${status}` },
                                    isRetryable: status >= 500 || status === 429
                                },
                                requestId: expect.any(String)
                            }
                        }
                    );
                });
            });

            it("should store error response in configured location", async () => {
                const mockResponse = {
                    status: 404,
                    ok: false,
                    statusText: "Not Found",
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ error: "Resource not found" })
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const configWithStorage = {
                    ...baseConfig,
                    failOnNon2xx: true,
                    responseTarget: "context",
                    responseKey: "errorResult"
                };

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithStorage as any
                } as any);

                expect(cognigy.api.addToContext).toHaveBeenCalledWith(
                    "errorResult",
                    {
                        success: false,
                        error: {
                            type: "HttpError",
                            message: "HTTP 404: Not Found",
                            status: 404,
                            details: {
                                responseBody: { error: "Resource not found" },
                                isRetryable: false
                            },
                            requestId: expect.any(String)
                        }
                    },
                    "simple"
                );
            });
        });

        describe("with failOnNon2xx=false", () => {
            const nonSuccessStatuses = [400, 401, 403, 404, 422, 429, 500, 502, 503];

            nonSuccessStatuses.forEach(status => {
                it(`should treat ${status} as success`, async () => {
                    const mockResponse = {
                        status,
                        ok: false,
                        statusText: `Status ${status}`,
                        headers: new Map([["content-type", "application/json"]]),
                        json: jest.fn().mockResolvedValue({ error: `Error ${status}` })
                    };

                    mockFetch.mockResolvedValue(mockResponse as any);

                    const cognigy = createMockCognigy({
                        input: {
                            data: { cxonetoken: "test-token" }
                        }
                    });

                    await cxoneAuthenticatedCall.function({
                        cognigy,
                        config: { ...baseConfig, failOnNon2xx: false } as any
                    } as any);

                    expect(cognigy.api.output).toHaveBeenCalledWith(
                        `Request completed with status ${status} (treated as success)`,
                        {
                            success: true,
                            data: {
                                status,
                                body: { error: `Error ${status}` }
                            }
                        }
                    );
                });
            });

            it("should preserve status code and body for non-2xx responses", async () => {
                const mockResponse = {
                    status: 422,
                    ok: false,
                    statusText: "Unprocessable Entity",
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({
                        validation_errors: ["Field 'name' is required", "Field 'email' is invalid"]
                    })
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: { ...baseConfig, failOnNon2xx: false } as any
                } as any);

                expect(cognigy.api.output).toHaveBeenCalledWith(
                    "Request completed with status 422 (treated as success)",
                    {
                        success: true,
                        data: {
                            status: 422,
                            body: {
                                validation_errors: ["Field 'name' is required", "Field 'email' is invalid"]
                            }
                        }
                    }
                );
            });

            it("should store non-2xx response as success in configured location", async () => {
                const mockResponse = {
                    status: 400,
                    ok: false,
                    statusText: "Bad Request",
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ message: "Invalid input" })
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const configWithStorage = {
                    ...baseConfig,
                    failOnNon2xx: false,
                    responseTarget: "input",
                    responseKey: "apiResult"
                };

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithStorage as any
                } as any);

                expect(cognigy.input.apiResult).toEqual({
                    success: true,
                    data: {
                        status: 400,
                        body: { message: "Invalid input" }
                    }
                });
            });
        });

        describe("status code classification logic", () => {
            it("should correctly identify retryable vs non-retryable status codes", async () => {
                const retryableStatuses = [429, 500, 502, 503];
                const nonRetryableStatuses = [400, 401, 403, 404, 422];

                // Test retryable statuses
                for (const status of retryableStatuses) {
                    const mockResponse = {
                        status,
                        ok: false,
                        statusText: `Status ${status}`,
                        headers: new Map([["content-type", "application/json"]]),
                        json: jest.fn().mockResolvedValue({ error: `Error ${status}` })
                    };

                    mockFetch.mockResolvedValue(mockResponse as any);

                    const cognigy = createMockCognigy({
                        input: {
                            data: { cxonetoken: "test-token" }
                        }
                    });

                    await cxoneAuthenticatedCall.function({
                        cognigy,
                        config: { ...baseConfig, failOnNon2xx: true } as any
                    } as any);

                    expect(cognigy.api.output).toHaveBeenCalledWith(
                        `HTTP ${status} Error`,
                        expect.objectContaining({
                            success: false,
                            error: expect.objectContaining({
                                details: expect.objectContaining({
                                    isRetryable: true
                                })
                            })
                        })
                    );

                    jest.clearAllMocks();
                }

                // Test non-retryable statuses
                for (const status of nonRetryableStatuses) {
                    const mockResponse = {
                        status,
                        ok: false,
                        statusText: `Status ${status}`,
                        headers: new Map([["content-type", "application/json"]]),
                        json: jest.fn().mockResolvedValue({ error: `Error ${status}` })
                    };

                    mockFetch.mockResolvedValue(mockResponse as any);

                    const cognigy = createMockCognigy({
                        input: {
                            data: { cxonetoken: "test-token" }
                        }
                    });

                    await cxoneAuthenticatedCall.function({
                        cognigy,
                        config: { ...baseConfig, failOnNon2xx: true } as any
                    } as any);

                    expect(cognigy.api.output).toHaveBeenCalledWith(
                        `HTTP ${status} Error`,
                        expect.objectContaining({
                            success: false,
                            error: expect.objectContaining({
                                details: expect.objectContaining({
                                    isRetryable: false
                                })
                            })
                        })
                    );

                    jest.clearAllMocks();
                }
            });

            it("should handle text responses for non-2xx status codes", async () => {
                const mockResponse = {
                    status: 500,
                    ok: false,
                    statusText: "Internal Server Error",
                    headers: new Map([["content-type", "text/plain"]]),
                    text: jest.fn().mockResolvedValue("Server is temporarily unavailable")
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: { ...baseConfig, failOnNon2xx: true } as any
                } as any);

                expect(cognigy.api.output).toHaveBeenCalledWith(
                    "HTTP 500 Error",
                    {
                        success: false,
                        error: {
                            type: "HttpError",
                            message: "HTTP 500: Internal Server Error",
                            status: 500,
                            details: {
                                responseBody: "Server is temporarily unavailable",
                                isRetryable: true
                            },
                            requestId: expect.any(String)
                        }
                    }
                );
            });

            it("should handle empty response bodies for non-2xx status codes", async () => {
                const mockResponse = {
                    status: 204,
                    ok: true, // 204 is actually successful but with no content
                    statusText: "No Content",
                    headers: new Map(),
                    text: jest.fn().mockResolvedValue("")
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: baseConfig as any
                } as any);

                expect(cognigy.api.output).toHaveBeenCalledWith(
                    "Request completed successfully",
                    {
                        success: true,
                        data: {
                            status: 204,
                            body: ""
                        }
                    }
                );
            });

            it("should handle response parsing errors for non-2xx responses", async () => {
                const mockResponse = {
                    status: 500,
                    ok: false,
                    statusText: "Internal Server Error",
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockRejectedValue(new Error("Malformed JSON response"))
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: baseConfig as any
                } as any);

                expect(cognigy.api.output).toHaveBeenCalledWith(
                    "Request failed",
                    {
                        success: false,
                        error: {
                            type: "NetworkError",
                            message: "Network error: Malformed JSON response",
                            status: 503,
                            details: {
                                isRetryable: true
                            },
                            requestId: expect.any(String)
                        }
                    }
                );
            });
        });

        describe("response storage for error vs success cases", () => {
            it("should store error responses when failOnNon2xx=true", async () => {
                const mockResponse = {
                    status: 403,
                    ok: false,
                    statusText: "Forbidden",
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ error: "Access denied" })
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const configWithStorage = {
                    ...baseConfig,
                    failOnNon2xx: true,
                    responseTarget: "context",
                    responseKey: "apiResponse"
                };

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithStorage as any
                } as any);

                expect(cognigy.api.addToContext).toHaveBeenCalledWith(
                    "apiResponse",
                    {
                        success: false,
                        error: expect.objectContaining({
                            type: "HttpError",
                            status: 403
                        })
                    },
                    "simple"
                );
            });

            it("should store success responses when failOnNon2xx=false", async () => {
                const mockResponse = {
                    status: 403,
                    ok: false,
                    statusText: "Forbidden",
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ error: "Access denied" })
                };

                mockFetch.mockResolvedValue(mockResponse as any);

                const configWithStorage = {
                    ...baseConfig,
                    failOnNon2xx: false,
                    responseTarget: "context",
                    responseKey: "apiResponse"
                };

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithStorage as any
                } as any);

                expect(cognigy.api.addToContext).toHaveBeenCalledWith(
                    "apiResponse",
                    {
                        success: true,
                        data: {
                            status: 403,
                            body: { error: "Access denied" }
                        }
                    },
                    "simple"
                );
            });

            it("should handle headers in non-2xx responses when enabled", async () => {
                const mockResponseWithHeaders = {
                    status: 429,
                    ok: false,
                    statusText: "Too Many Requests",
                    headers: new Map([
                        ["content-type", "application/json"],
                        ["retry-after", "60"],
                        ["x-ratelimit-remaining", "0"]
                    ]),
                    json: jest.fn().mockResolvedValue({ error: "Rate limit exceeded" })
                };

                // Mock the forEach method for headers
                mockResponseWithHeaders.headers.forEach = jest.fn((callback) => {
                    callback("application/json", "content-type", mockResponseWithHeaders.headers);
                    callback("60", "retry-after", mockResponseWithHeaders.headers);
                    callback("0", "x-ratelimit-remaining", mockResponseWithHeaders.headers);
                });

                mockFetch.mockResolvedValue(mockResponseWithHeaders as any);

                const configWithHeaders = {
                    ...baseConfig,
                    failOnNon2xx: false,
                    storeResponseHeaders: true,
                    responseTarget: "context",
                    responseKey: "apiResponse"
                };

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithHeaders as any
                } as any);

                expect(cognigy.api.addToContext).toHaveBeenCalledWith(
                    "apiResponse",
                    {
                        success: true,
                        data: {
                            status: 429,
                            body: { error: "Rate limit exceeded" },
                            headers: {
                                "content-type": "application/json",
                                "retry-after": "60",
                                "x-ratelimit-remaining": "0"
                            }
                        }
                    },
                    "simple"
                );
            });
        });

        describe("error vs success output messaging", () => {
            it("should use different output messages for error vs success modes", async () => {
                const mockResponse = {
                    status: 400,
                    ok: false,
                    statusText: "Bad Request",
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ error: "Invalid request" })
                };

                // Test error mode (failOnNon2xx=true)
                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigyError = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy: cognigyError,
                    config: { ...baseConfig, failOnNon2xx: true } as any
                } as any);

                expect(cognigyError.api.output).toHaveBeenCalledWith(
                    "HTTP 400 Error",
                    expect.objectContaining({ success: false })
                );

                jest.clearAllMocks();

                // Test success mode (failOnNon2xx=false)
                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigySuccess = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy: cognigySuccess,
                    config: { ...baseConfig, failOnNon2xx: false } as any
                } as any);

                expect(cognigySuccess.api.output).toHaveBeenCalledWith(
                    "Request completed with status 400 (treated as success)",
                    expect.objectContaining({ success: true })
                );
            });

            it("should handle 2xx responses consistently regardless of failOnNon2xx setting", async () => {
                const mockResponse = {
                    status: 201,
                    ok: true,
                    statusText: "Created",
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ id: 123, created: true })
                };

                // Test with failOnNon2xx=true
                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy1 = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy: cognigy1,
                    config: { ...baseConfig, failOnNon2xx: true } as any
                } as any);

                expect(cognigy1.api.output).toHaveBeenCalledWith(
                    "Request completed successfully",
                    expect.objectContaining({ success: true })
                );

                jest.clearAllMocks();

                // Test with failOnNon2xx=false
                mockFetch.mockResolvedValue(mockResponse as any);

                const cognigy2 = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy: cognigy2,
                    config: { ...baseConfig, failOnNon2xx: false } as any
                } as any);

                expect(cognigy2.api.output).toHaveBeenCalledWith(
                    "Request completed successfully",
                    expect.objectContaining({ success: true })
                );
            });
        });
    });

    describe("timeout scenarios", () => {
        it("should timeout request after configured timeoutMs", async () => {
            // Mock AbortError to simulate timeout
            mockFetch.mockImplementation(() => {
                const error = new Error("Request timeout after 5000ms");
                error.name = "TimeoutError";
                return Promise.reject(error);
            });

            const configWithTimeout = {
                ...baseConfig,
                timeoutMs: 5000
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithTimeout as any
            } as any);

            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request failed",
                {
                    success: false,
                    error: {
                        type: "Timeout",
                        message: "Request timeout after 5000ms",
                        status: 408,
                        details: {
                            timeoutMs: 5000,
                            hardLimitMs: 20000,
                            cognigyStandard: "20-second execution budget"
                        },
                        requestId: expect.any(String)
                    }
                }
            );
        });

        it("should timeout with retry enabled", async () => {
            let attemptCount = 0;

            // Mock setTimeout to avoid actual delays
            const originalSetTimeout = global.setTimeout;
            global.setTimeout = jest.fn((callback: Function) => {
                callback();
                return {} as any;
            }) as any;

            mockFetch.mockImplementation(() => {
                attemptCount++;
                const error = new Error(`Request timeout after 3000ms (attempt ${attemptCount})`);
                error.name = "TimeoutError";
                return Promise.reject(error);
            });

            const configWithRetryAndTimeout = {
                ...baseConfig,
                timeoutMs: 3000,
                enableRetry: true,
                retryAttempts: 2
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithRetryAndTimeout as any
            } as any);

            // Timeout errors ARE retryable, so should retry
            expect(attemptCount).toBe(3);
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request failed",
                {
                    success: false,
                    error: {
                        type: "Timeout",
                        message: expect.stringMatching(/Request timeout after 3000ms/),
                        status: 408,
                        details: {
                            timeoutMs: 3000,
                            hardLimitMs: 20000,
                            cognigyStandard: "20-second execution budget"
                        },
                        requestId: expect.any(String)
                    }
                }
            );

            // Restore setTimeout
            global.setTimeout = originalSetTimeout;
        });

        it("should handle AbortController timeout mechanism", async () => {
            let abortSignal: AbortSignal | undefined;

            mockFetch.mockImplementation((_url, options) => {
                abortSignal = options?.signal as AbortSignal;

                // Return success response
                const mockResponse = {
                    status: 200,
                    ok: true,
                    headers: new Map([["content-type", "application/json"]]),
                    json: jest.fn().mockResolvedValue({ success: true })
                };
                return Promise.resolve(mockResponse as any);
            });

            const configWithTimeout = {
                ...baseConfig,
                timeoutMs: 2000
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithTimeout as any
            } as any);

            // Verify AbortSignal was provided
            expect(abortSignal).toBeDefined();
            expect(abortSignal).toBeInstanceOf(AbortSignal);
        });
    });

    describe("retry scenarios", () => {
        describe("fail then succeed scenarios", () => {
            it("should succeed on retry after initial network failure", async () => {
                let attemptCount = 0;
                mockFetch.mockImplementation(() => {
                    attemptCount++;
                    if (attemptCount === 1) {
                        return Promise.reject(new Error("Network failure"));
                    } else {
                        const mockResponse = {
                            status: 200,
                            ok: true,
                            headers: new Map([["content-type", "application/json"]]),
                            json: jest.fn().mockResolvedValue({ success: true, attempt: attemptCount })
                        };
                        return Promise.resolve(mockResponse as any);
                    }
                });

                const configWithRetry = {
                    ...baseConfig,
                    enableRetry: true,
                    retryAttempts: 1
                };

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithRetry as any
                } as any);

                expect(cognigy.api.output).toHaveBeenCalledWith(
                    "Request completed successfully",
                    {
                        success: true,
                        data: {
                            status: 200,
                            body: { success: true, attempt: 2 },
                            retryInfo: {
                                attempts: 2,
                                elapsedMs: expect.any(Number)
                            }
                        }
                    }
                );

                expect(attemptCount).toBe(2);
            });

            it("should succeed on retry after initial 500 error", async () => {
                let attemptCount = 0;
                mockFetch.mockImplementation(() => {
                    attemptCount++;
                    if (attemptCount === 1) {
                        const mockErrorResponse = {
                            status: 500,
                            ok: false,
                            statusText: "Internal Server Error",
                            headers: new Map([["content-type", "application/json"]]),
                            json: jest.fn().mockResolvedValue({ error: "Temporary server error" })
                        };
                        return Promise.resolve(mockErrorResponse as any);
                    } else {
                        const mockSuccessResponse = {
                            status: 200,
                            ok: true,
                            headers: new Map([["content-type", "application/json"]]),
                            json: jest.fn().mockResolvedValue({ success: true, recovered: true })
                        };
                        return Promise.resolve(mockSuccessResponse as any);
                    }
                });

                const configWithRetry = {
                    ...baseConfig,
                    enableRetry: true,
                    retryAttempts: 2
                };

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithRetry as any
                } as any);

                expect(cognigy.api.output).toHaveBeenCalledWith(
                    "Request completed successfully",
                    {
                        success: true,
                        data: {
                            status: 200,
                            body: { success: true, recovered: true },
                            retryInfo: {
                                attempts: 2,
                                elapsedMs: expect.any(Number)
                            }
                        }
                    }
                );

                expect(attemptCount).toBe(2);
            });
        });

        describe("fail until exhausted scenarios", () => {
            it("should make multiple attempts on network failures", async () => {
                let attemptCount = 0;

                // Mock setTimeout to avoid actual delays in tests
                const originalSetTimeout = global.setTimeout;
                global.setTimeout = jest.fn((callback: Function) => {
                    callback();
                    return {} as any;
                }) as any;

                mockFetch.mockImplementation(() => {
                    attemptCount++;
                    return Promise.reject(new Error(`Network failure attempt ${attemptCount}`));
                });

                const configWithRetry = {
                    ...baseConfig,
                    enableRetry: true,
                    retryAttempts: 2
                };

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithRetry as any
                } as any);

                expect(attemptCount).toBe(3); // Should make 3 attempts total

                // On final attempt, should exit with NetworkError
                expect(cognigy.api.output).toHaveBeenCalledWith(
                    "Request failed",
                    {
                        success: false,
                        error: {
                            type: "NetworkError",
                            message: "Network error: Network failure attempt 3",
                            status: 503,
                            details: {
                                isRetryable: true
                            },
                            requestId: expect.any(String)
                        }
                    }
                );

                // Restore setTimeout
                global.setTimeout = originalSetTimeout;
            });

            it("should handle final attempt error correctly", async () => {
                let attemptCount = 0;

                // Mock setTimeout to avoid actual delays in tests
                const originalSetTimeout = global.setTimeout;
                global.setTimeout = jest.fn((callback: Function) => {
                    callback();
                    return {} as any;
                }) as any;

                mockFetch.mockImplementation(() => {
                    attemptCount++;
                    return Promise.reject(new Error("Persistent connection error"));
                });

                const configWithRetry = {
                    ...baseConfig,
                    enableRetry: true,
                    retryAttempts: 1
                };

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithRetry as any
                } as any);

                expect(attemptCount).toBe(2); // Should make 2 attempts total

                // On final attempt, should exit with NetworkError
                expect(cognigy.api.output).toHaveBeenCalledWith(
                    "Request failed",
                    {
                        success: false,
                        error: {
                            type: "NetworkError",
                            message: "Network error: Persistent connection error",
                            status: 503,
                            details: {
                                isRetryable: true
                            },
                            requestId: expect.any(String)
                        }
                    }
                );

                // Restore setTimeout
                global.setTimeout = originalSetTimeout;
            });

        });

        describe("retry logic", () => {
            it("should not retry non-retryable errors (4xx)", async () => {
                const nonRetryableStatuses = [400, 401, 403, 404, 422];

                for (const status of nonRetryableStatuses) {
                    let attemptCount = 0;
                    mockFetch.mockImplementation(() => {
                        attemptCount++;
                        const mockErrorResponse = {
                            status,
                            ok: false,
                            statusText: `Status ${status}`,
                            headers: new Map([["content-type", "application/json"]]),
                            json: jest.fn().mockResolvedValue({ error: `Error ${status}` })
                        };
                        return Promise.resolve(mockErrorResponse as any);
                    });

                    const configWithRetry = {
                        ...baseConfig,
                        enableRetry: true,
                        retryAttempts: 3,
                        failOnNon2xx: true
                    };

                    const cognigy = createMockCognigy({
                        input: {
                            data: { cxonetoken: "test-token" }
                        }
                    });

                    await cxoneAuthenticatedCall.function({
                        cognigy,
                        config: configWithRetry as any
                    } as any);

                    // Should not retry, only one attempt
                    expect(attemptCount).toBe(1);
                    expect(cognigy.api.output).toHaveBeenCalledWith(
                        `HTTP ${status} Error`,
                        expect.objectContaining({
                            success: false,
                            error: expect.objectContaining({
                                type: "HttpError",
                                status
                            })
                        })
                    );

                    jest.clearAllMocks();
                }
            });

            it("should handle disabled retries", async () => {
                let attemptCount = 0;
                mockFetch.mockImplementation(() => {
                    attemptCount++;
                    return Promise.reject(new Error("Network failure"));
                });

                const configWithoutRetry = {
                    ...baseConfig,
                    enableRetry: false
                };

                const cognigy = createMockCognigy({
                    input: {
                        data: { cxonetoken: "test-token" }
                    }
                });

                await cxoneAuthenticatedCall.function({
                    cognigy,
                    config: configWithoutRetry as any
                } as any);

                expect(attemptCount).toBe(1);
                expect(cognigy.api.output).toHaveBeenCalledWith(
                    "Request failed",
                    expect.objectContaining({
                        success: false,
                        error: expect.objectContaining({
                            type: "NetworkError"
                        })
                    })
                );
            });
        });
    });

    describe("storage behavior comprehensive", () => {
        it("should store success response with headers in context", async () => {
            const mockResponseWithHeaders = {
                status: 200,
                ok: true,
                headers: new Map([
                    ["content-type", "application/json"],
                    ["x-custom-header", "custom-value"],
                    ["server", "nginx/1.18.0"]
                ]),
                json: jest.fn().mockResolvedValue({ success: true, data: "test" })
            };

            // Mock the forEach method for headers
            mockResponseWithHeaders.headers.forEach = jest.fn((callback) => {
                callback("application/json", "content-type", mockResponseWithHeaders.headers);
                callback("custom-value", "x-custom-header", mockResponseWithHeaders.headers);
                callback("nginx/1.18.0", "server", mockResponseWithHeaders.headers);
            });

            mockFetch.mockResolvedValue(mockResponseWithHeaders as any);

            const configWithHeaders = {
                ...baseConfig,
                responseTarget: "context",
                responseKey: "api.response",
                storeResponseHeaders: true
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithHeaders as any
            } as any);

            expect(cognigy.api.addToContext).toHaveBeenCalledWith(
                "api.response",
                {
                    success: true,
                    data: {
                        status: 200,
                        body: { success: true, data: "test" },
                        headers: {
                            "content-type": "application/json",
                            "x-custom-header": "custom-value",
                            "server": "nginx/1.18.0"
                        }
                    }
                },
                "simple"
            );
        });

        it("should store error response in input target", async () => {
            mockFetch.mockRejectedValue(new Error("Connection failed"));

            const configWithInput = {
                ...baseConfig,
                responseTarget: "input",
                responseKey: "errorResponse"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithInput as any
            } as any);

            expect(cognigy.input.errorResponse).toEqual({
                success: false,
                error: {
                    type: "NetworkError",
                    message: "Network error: Connection failed",
                    status: 503,
                    details: {
                        isRetryable: true
                    },
                    requestId: expect.any(String)
                }
            });
        });

        it("should handle storage key variations (dot-notation)", async () => {
            const mockResponse = {
                status: 201,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ id: 123, created: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const configWithDotNotation = {
                ...baseConfig,
                responseTarget: "context",
                responseKey: "api.responses.latest"
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithDotNotation as any
            } as any);

            expect(cognigy.api.addToContext).toHaveBeenCalledWith(
                "api.responses.latest",
                {
                    success: true,
                    data: {
                        status: 201,
                        body: { id: 123, created: true }
                    }
                },
                "simple"
            );
        });

        it("should handle storage failure scenarios gracefully", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            // Mock addToContext to throw an error
            cognigy.api.addToContext = jest.fn().mockImplementation(() => {
                throw new Error("Storage failed");
            });

            const configWithStorage = {
                ...baseConfig,
                responseTarget: "context",
                responseKey: "storageTest"
            };

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithStorage as any
            } as any);

            // Should still complete successfully and log the storage error
            expect(cognigy.api.output).toHaveBeenCalledWith(
                "Request completed successfully",
                expect.objectContaining({ success: true })
            );

            expect(cognigy.api.log).toHaveBeenCalledWith(
                "error",
                expect.stringMatching(/Failed to store response data with key storageTest: Storage failed/)
            );
        });
    });

    describe("secret redaction verification", () => {
        it("should redact cxonetoken in debug output", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const configWithDebug = {
                ...baseConfig,
                debugMode: true
            };

            const testToken = "secret-token-12345";
            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: testToken }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithDebug as any
            } as any);

            // Check that no debug log contains the actual token
            const logCalls = cognigy.api.log.mock.calls;
            for (const call of logCalls) {
                const logLevel = call[0];
                const logMessage = call[1];
                if (logLevel === "info" && logMessage.includes("[DEBUG]")) {
                    expect(logMessage).not.toContain(testToken);
                }
            }
        });

        it("should redact Authorization headers in debug output", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const configWithDebugAndAuth = {
                ...baseConfig,
                debugMode: true,
                headers: {
                    "Authorization": "Bearer user-provided-secret-token",
                    "X-API-Key": "another-secret-key"
                }
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "main-secret-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithDebugAndAuth as any
            } as any);

            // Check that debug logs don't contain actual secrets
            const logCalls = cognigy.api.log.mock.calls;
            for (const call of logCalls) {
                const logLevel = call[0];
                const logMessage = call[1];
                if (logLevel === "info" && logMessage.includes("[DEBUG]")) {
                    expect(logMessage).not.toContain("user-provided-secret-token");
                    expect(logMessage).not.toContain("another-secret-key");
                    expect(logMessage).not.toContain("main-secret-token");
                }
            }
        });

        it("should never log actual token values", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const sensitiveData = {
                token: "secret-token-value",
                password: "user-password-123",
                key: "api-key-secret",
                credential: "user-credentials",
                auth: "auth-token-value"
            };

            const configWithSensitiveData = {
                ...baseConfig,
                debugMode: true,
                headers: sensitiveData
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "main-token-secret" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithSensitiveData as any
            } as any);

            // Verify no actual sensitive values appear in any log
            const allLogCalls = cognigy.api.log.mock.calls;
            for (const call of allLogCalls) {
                const logMessage = call[1];
                expect(logMessage).not.toContain("secret-token-value");
                expect(logMessage).not.toContain("user-password-123");
                expect(logMessage).not.toContain("api-key-secret");
                expect(logMessage).not.toContain("user-credentials");
                expect(logMessage).not.toContain("auth-token-value");
                expect(logMessage).not.toContain("main-token-secret");
            }
        });

        it("should preserve last 4 characters of redacted strings", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const configWithDebug = {
                ...baseConfig,
                debugMode: true,
                headers: {
                    "Authorization": "Bearer very-long-secret-token-12345"
                }
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "another-long-token-67890" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithDebug as any
            } as any);

            // Look for redacted patterns in debug logs
            const debugLogs = cognigy.api.log.mock.calls
                .filter(call => call[0] === "info" && call[1].includes("[DEBUG]"))
                .map(call => call[1]);

            // Should find redacted tokens with last 4 chars
            const foundRedacted = debugLogs.some(log =>
                log.includes("***2345") || log.includes("***7890")
            );

            expect(foundRedacted).toBe(true);
        });

        it("should redact sensitive keys (password, secret, key, credential, auth, bearer)", async () => {
            const mockResponse = {
                status: 200,
                ok: true,
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true })
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const configWithAllSensitiveKeys = {
                ...baseConfig,
                debugMode: true,
                headers: {
                    "password": "mypassword123",
                    "secret": "mysecret456",
                    "api-key": "apikey789",
                    "credential": "mycred000",
                    "auth": "myauth111",
                    "bearer": "mybearer222",
                    "normal-header": "not-secret-value"
                }
            };

            const cognigy = createMockCognigy({
                input: {
                    data: { cxonetoken: "test-token" }
                }
            });

            await cxoneAuthenticatedCall.function({
                cognigy,
                config: configWithAllSensitiveKeys as any
            } as any);

            // Find debug logs containing headers
            const debugLogs = cognigy.api.log.mock.calls
                .filter(call => call[0] === "info" && call[1].includes("[DEBUG]") && call[1].includes("headers"))
                .map(call => call[1]);

            expect(debugLogs.length).toBeGreaterThan(0);

            for (const log of debugLogs) {
                // Verify original sensitive values are NOT present
                expect(log).not.toContain("mypassword123");
                expect(log).not.toContain("mysecret456");
                expect(log).not.toContain("apikey789");
                expect(log).not.toContain("mycred000");
                expect(log).not.toContain("myauth111");
                expect(log).not.toContain("mybearer222");

                // Verify redacted versions ARE present (preserves last 4 chars)
                expect(log).toContain("***d123"); // mypassword123 -> ***d123
                expect(log).toContain("***t456"); // mysecret456 -> ***t456
                expect(log).toContain("***y789"); // apikey789 -> ***y789
                expect(log).toContain("***d000"); // mycred000 -> ***d000
                expect(log).toContain("***h111"); // myauth111 -> ***h111
                expect(log).toContain("***r222"); // mybearer222 -> ***r222

                // Non-sensitive value should appear unchanged
                expect(log).toContain("not-secret-value");
            }
        });
    });
});