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
            [JSON.stringify(baseConfig.optionalParamsObject)]
        );
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneHandover",
            expect.stringContaining("Signaled CXone with:"),
            "simple"
        );
    });

    it("throws when connection is missing", async () => {
        const cognigy = createMockCognigy();
        await expect(
            handoverToCXone.function({
                cognigy,
                config: { ...baseConfig, connection: undefined } as any
            } as any)
        ).rejects.toThrow("handoverToCXone: Validation: Connection configuration is required");
    });

    it("throws when environmentUrl is missing", async () => {
        const cognigy = createMockCognigy();
        await expect(
            handoverToCXone.function({
                cognigy,
                config: { ...baseConfig, connection: { ...baseConfig.connection, environmentUrl: "" } } as any
            } as any)
        ).rejects.toThrow("handoverToCXone: Validation: Environment URL is required");
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

    it("handles errors from sendSignalHandover", async () => {
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
        ).rejects.toThrow("signal error");

        expect(cognigy.api.log).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("handoverToCXone: Error signaling CXone")
        );
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneHandover",
            expect.stringContaining("Error signaling CXone"),
            "simple"
        );
        expect(cognigy.api.output).toHaveBeenCalledWith(
            "Something is not working. Please retry.",
            expect.objectContaining({ error: expect.any(String) })
        );
    });
});
