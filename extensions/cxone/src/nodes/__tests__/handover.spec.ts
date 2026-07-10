/// <reference types="jest" />

import { handoverToCXone } from "../handover";
import { createMockCognigy } from "../../test-utils/mockCognigyApi";

jest.mock("../../api/cxone-api-client");
jest.mock("../../helpers/tms-payload", () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue({ tms: "payload" })
}));

import { CXoneApiClient } from "../../api/cxone-api-client";
const transformConversation = require("../../helpers/tms-payload").default as jest.Mock;

describe("handoverToCXone node", () => {
    let setTimeoutSpy: jest.SpyInstance;
    let mockApiClient: jest.Mocked<CXoneApiClient>;

    const baseConfig = {
        action: "End",
        businessNumber: "BU-1",
        contactId: "12345",
        spawnedContactId: "67890",
        optionalParamsObject: [{ foo: "bar" }],
        connection: {
            environmentUrl: "https://cxone.niceincontact.com",
            accessKeyId: "ak",
            accessKeySecret: "as",
            clientId: "cid",
            clientSecret: "cs"
        }
    };

    beforeEach(() => {
        setTimeoutSpy = jest
            .spyOn(global, "setTimeout" as any)
            .mockImplementation((fn: any) => {
                // call the callback immediately
                fn();
                return 0 as any;
            });

        // Mock the API client
        mockApiClient = {
            sendSignalHandover: jest.fn().mockResolvedValue(204),
            postTranscript: jest.fn().mockResolvedValue(201)
        } as any;

        (CXoneApiClient as jest.MockedClass<typeof CXoneApiClient>).mockImplementation(() => mockApiClient);

        jest.clearAllMocks();
    });

    afterEach(() => {
        setTimeoutSpy.mockRestore();
    });

    it("performs voice handover with transcript and posts to TMS and CXone", async () => {
        const transcript = [
            { role: "user", type: "input", payload: { text: "Hi" }, timestamp: Date.now() }
        ];

        const cognigy = createMockCognigy({
            input: {
                channel: "voice",
                transcript
            },
            context: {}
        });

        await handoverToCXone.function({
            cognigy,
            config: baseConfig as any
        } as any);

        expect(transformConversation).toHaveBeenCalledWith(
            transcript,
            baseConfig.action,
            baseConfig.contactId,
            baseConfig.businessNumber
        );
        expect(mockApiClient.postTranscript).toHaveBeenCalledWith({ tms: "payload" });
        expect(mockApiClient.sendSignalHandover).toHaveBeenCalledWith(
            baseConfig.spawnedContactId,
            baseConfig.action,
            baseConfig.optionalParamsObject.map((p: any) =>
                typeof p === "string" ? p : JSON.stringify(p)
            )
        );
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneHandover",
            expect.objectContaining({ success: true, action: baseConfig.action }),
            "simple"
        );
    });

    it("continues without throwing when connection is missing and no errorChild is wired", async () => {
        const cognigy = createMockCognigy();
        await expect(
            handoverToCXone.function({
                cognigy,
                config: { ...baseConfig, connection: undefined } as any
            } as any)
        ).resolves.toBeUndefined();

        expect(cognigy.api.log).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("Connection configuration is required")
        );
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneHandover",
            expect.objectContaining({ success: false, stage: "validation" }),
            "simple"
        );
    });

    it("continues without throwing when environmentUrl is missing and no errorChild is wired", async () => {
        const cognigy = createMockCognigy();
        await expect(
            handoverToCXone.function({
                cognigy,
                config: { ...baseConfig, connection: { ...baseConfig.connection, environmentUrl: "" } } as any
            } as any)
        ).resolves.toBeUndefined();

        expect(cognigy.api.log).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("Environment URL is required")
        );
    });

    it("handles non-voice (Guide Chat) by outputting CXone payload", async () => {
        const cognigy = createMockCognigy({
            input: {
                channel: "webchat",
                transcript: []
            }
        });

        await handoverToCXone.function({
            cognigy,
            config: baseConfig as any
        } as any);

        expect(cognigy.api.output).toHaveBeenCalledWith(
            "",
            expect.objectContaining({
                _cognigy: expect.any(Object)
            })
        );
        expect(mockApiClient.sendSignalHandover).not.toHaveBeenCalled();
    });

    it("does not call CXone APIs when contactId sentinel is used", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await handoverToCXone.function({
            cognigy,
            config: { ...baseConfig, contactId: "100000000000", spawnedContactId: "100000000000" } as any
        } as any);

        expect(mockApiClient.sendSignalHandover).not.toHaveBeenCalled();
    });

    it("logs and continues when postToTMS fails", async () => {
        (mockApiClient.postTranscript as jest.Mock).mockRejectedValueOnce(new Error("TMS error"));

        const cognigy = createMockCognigy({
            input: {
                channel: "voice",
                transcript: [
                    { role: "user", type: "input", payload: { text: "Hi" }, timestamp: Date.now() }
                ]
            }
        });

        await handoverToCXone.function({
            cognigy,
            config: baseConfig as any
        } as any);

        expect(cognigy.api.log).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("Error posting transcript to TMS")
        );
        // still proceeds to sendSignalHandover
        expect(mockApiClient.sendSignalHandover).toHaveBeenCalled();
    });

    it("routes to onSuccessHandover child when sendSignalHandover succeeds", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await handoverToCXone.function({
            cognigy,
            config: baseConfig as any,
            childConfigs: [
                { id: "success-id", type: "onSuccessHandover", config: {} },
                { id: "error-id", type: "onErrorHandover", config: {} }
            ]
        } as any);

        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("success-id");
    });

    it("routes to onErrorHandover child instead of throwing when sendSignalHandover fails", async () => {
        (mockApiClient.sendSignalHandover as jest.Mock).mockRejectedValueOnce(new Error("signal error"));
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await handoverToCXone.function({
            cognigy,
            config: baseConfig as any,
            childConfigs: [
                { id: "success-id", type: "onSuccessHandover", config: {} },
                { id: "error-id", type: "onErrorHandover", config: {} }
            ]
        } as any);

        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("error-id");
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneHandover",
            expect.objectContaining({ success: false, error: "signal error" }),
            "simple"
        );
    });

    it("routes to onErrorHandover child on validation failure", async () => {
        const cognigy = createMockCognigy();

        await handoverToCXone.function({
            cognigy,
            config: { ...baseConfig, connection: undefined } as any,
            childConfigs: [
                { id: "error-id", type: "onErrorHandover", config: {} }
            ]
        } as any);

        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("error-id");
    });

    it("does not throw when sendSignalHandover fails and no errorChild is wired", async () => {
        (mockApiClient.sendSignalHandover as jest.Mock).mockRejectedValueOnce(
            new Error("signal error")
        );
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await expect(
            handoverToCXone.function({
                cognigy,
                config: baseConfig as any
            } as any)
        ).resolves.toBeUndefined();

        expect(cognigy.api.log).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("handoverToCXone: Error signaling CXone")
        );
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneHandover",
            expect.objectContaining({ success: false, error: "signal error" }),
            "simple"
        );
        expect(cognigy.api.output).toHaveBeenCalledWith(
            "Something is not working. Please retry.",
            expect.objectContaining({ error: expect.any(String) })
        );
    });

    it("routes to On Failure instead of halting when api calls throw during error handling (gRPC connection closing)", async () => {
        (mockApiClient.sendSignalHandover as jest.Mock).mockRejectedValueOnce(
            new Error("1 CANCELLED: grpc: the client connection is closing")
        );
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });
        // Simulate the closing gRPC connection: diagnostic writes in the catch block throw too
        cognigy.api.log.mockImplementation((level: string) => {
            if (level === "error") {
                throw new Error("1 CANCELLED: grpc: the client connection is closing");
            }
        });
        cognigy.api.addToContext.mockImplementation(() => {
            throw new Error("1 CANCELLED: grpc: the client connection is closing");
        });

        await expect(
            handoverToCXone.function({
                cognigy,
                config: baseConfig as any,
                childConfigs: [
                    { id: "success-id", type: "onSuccessHandover", config: {} },
                    { id: "error-id", type: "onErrorHandover", config: {} }
                ]
            } as any)
        ).resolves.toBeUndefined();

        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("error-id");
    });

    it("never rejects even when every api call throws", async () => {
        const boom = () => {
            throw new Error("1 CANCELLED: grpc: the client connection is closing");
        };
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });
        cognigy.api.log.mockImplementation(boom);
        cognigy.api.addToContext.mockImplementation(boom);
        cognigy.api.output.mockImplementation(boom);
        cognigy.api.setNextNode.mockImplementation(boom);

        await expect(
            handoverToCXone.function({
                cognigy,
                config: baseConfig as any,
                childConfigs: [
                    { id: "success-id", type: "onSuccessHandover", config: {} },
                    { id: "error-id", type: "onErrorHandover", config: {} }
                ]
            } as any)
        ).resolves.toBeUndefined();
    });

    it("does not send the CXone digital payload to the Interactions Panel (adminconsole) channel", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "adminconsole", transcript: [] }
        });

        await handoverToCXone.function({
            cognigy,
            config: baseConfig as any,
            childConfigs: [
                { id: "success-id", type: "onSuccessHandover", config: {} },
                { id: "error-id", type: "onErrorHandover", config: {} }
            ]
        } as any);

        expect(cognigy.api.output).not.toHaveBeenCalled();
        expect(mockApiClient.sendSignalHandover).not.toHaveBeenCalled();
        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("success-id");
    });

    it("continues without throwing when contactId is missing and no errorChild is wired", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await expect(handoverToCXone.function({
            cognigy,
            config: { ...baseConfig, contactId: "" } as any
        } as any)).resolves.toBeUndefined();

        expect(cognigy.api.log).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("Contact ID is required")
        );
        expect(mockApiClient.sendSignalHandover).not.toHaveBeenCalled();
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneHandover",
            expect.objectContaining({ success: false, stage: "validation" }),
            "simple"
        );
    });

    it("continues without throwing when contactId is undefined", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await expect(handoverToCXone.function({
            cognigy,
            config: { ...baseConfig, contactId: undefined } as any
        } as any)).resolves.toBeUndefined();

        expect(mockApiClient.sendSignalHandover).not.toHaveBeenCalled();
    });

    it("treats whitespace-only contactId as missing", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await expect(handoverToCXone.function({
            cognigy,
            config: { ...baseConfig, contactId: "   " } as any
        } as any)).resolves.toBeUndefined();

        expect(cognigy.api.log).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("Contact ID is required")
        );
        expect(mockApiClient.sendSignalHandover).not.toHaveBeenCalled();
    });

    it("routes to onErrorHandover child when contactId is missing", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await handoverToCXone.function({
            cognigy,
            config: { ...baseConfig, contactId: "" } as any,
            childConfigs: [
                { id: "success-id", type: "onSuccessHandover", config: {} },
                { id: "error-id", type: "onErrorHandover", config: {} }
            ]
        } as any);

        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("error-id");
        expect(mockApiClient.sendSignalHandover).not.toHaveBeenCalled();
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneHandover",
            expect.objectContaining({ success: false, stage: "validation" }),
            "simple"
        );
    });

    it("continues without throwing when spawnedContactId is missing and no errorChild is wired", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await expect(handoverToCXone.function({
            cognigy,
            config: { ...baseConfig, spawnedContactId: "" } as any
        } as any)).resolves.toBeUndefined();

        expect(cognigy.api.log).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("Spawned Contact ID is required")
        );
        expect(mockApiClient.sendSignalHandover).not.toHaveBeenCalled();
    });

    it("continues without throwing when spawnedContactId is undefined", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await expect(handoverToCXone.function({
            cognigy,
            config: { ...baseConfig, spawnedContactId: undefined } as any
        } as any)).resolves.toBeUndefined();

        expect(mockApiClient.sendSignalHandover).not.toHaveBeenCalled();
    });

    it("treats whitespace-only spawnedContactId as missing", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await expect(handoverToCXone.function({
            cognigy,
            config: { ...baseConfig, spawnedContactId: "   " } as any
        } as any)).resolves.toBeUndefined();

        expect(cognigy.api.log).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("Spawned Contact ID is required")
        );
        expect(mockApiClient.sendSignalHandover).not.toHaveBeenCalled();
    });

    it("routes to onErrorHandover child when spawnedContactId is missing", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice", transcript: [] }
        });

        await handoverToCXone.function({
            cognigy,
            config: { ...baseConfig, spawnedContactId: "" } as any,
            childConfigs: [
                { id: "success-id", type: "onSuccessHandover", config: {} },
                { id: "error-id", type: "onErrorHandover", config: {} }
            ]
        } as any);

        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("error-id");
        expect(mockApiClient.sendSignalHandover).not.toHaveBeenCalled();
    });
});
