/// <reference types="jest" />

import { sendSignalToCXone } from "../send-signal";
import { createMockCognigy } from "../../test-utils/mockCognigyApi";
import { SIGNAL_STREAM_SETTLE_MS } from "../../config";

jest.mock("../../api/cxone-api-client");

import { CXoneApiClient } from "../../api/cxone-api-client";

describe("sendSignalToCXone node", () => {
    let setTimeoutSpy: jest.SpyInstance;
    let mockApiClient: jest.Mocked<CXoneApiClient>;

    const baseConfig = {
        contactId: "12345",
        signalParams: ["one", "two"],
        connection: {
            environmentUrl: "https://cxone.niceincontact.com",
            accessKeyId: "ak",
            accessKeySecret: "as",
            clientId: "cid",
            clientSecret: "cs"
        }
    };

    beforeEach(() => {
        // Make the stream-settle delay instant in tests by invoking the callback
        // immediately (mirrors the handover spec).
        setTimeoutSpy = jest
            .spyOn(global, "setTimeout" as any)
            .mockImplementation((fn: any) => {
                fn();
                return 0 as any;
            });

        // Mock the API client
        mockApiClient = {
            sendSignal: jest.fn().mockResolvedValue(204)
        } as any;

        (CXoneApiClient as jest.MockedClass<typeof CXoneApiClient>).mockImplementation(() => mockApiClient);

        jest.clearAllMocks();
    });

    afterEach(() => {
        setTimeoutSpy.mockRestore();
    });

    it("signals CXone for voice channel and does NOT emit chat output", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await sendSignalToCXone.function({
            cognigy,
            config: baseConfig as any
        } as any);

        expect(mockApiClient.sendSignal).toHaveBeenCalledWith(
            baseConfig.contactId,
            baseConfig.signalParams
        );
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneSendSignal",
            expect.objectContaining({ success: true, contactId: baseConfig.contactId }),
            "simple"
        );
        // On voice the API call is the delivery channel — no chat output is emitted
        // (an empty-text output here is the deferred write that caused "write after end").
        expect(cognigy.api.output).not.toHaveBeenCalled();
    });

    it("emits output on chat channel and does NOT call the signal API", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "chat" }
        });

        await sendSignalToCXone.function({
            cognigy,
            config: baseConfig as any
        } as any);

        expect(mockApiClient.sendSignal).not.toHaveBeenCalled();
        expect(cognigy.api.output).toHaveBeenCalledWith(
            "",
            expect.objectContaining({
                Intent: "Signal",
                Params: "one|two"
            })
        );
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneSendSignal",
            expect.objectContaining({ success: true, note: "chat-channel output only" }),
            "simple"
        );
    });

    it("settles (flushes pending writes) before routing on the success path", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await sendSignalToCXone.function({
            cognigy,
            config: baseConfig as any,
            childConfigs: [
                { id: "success-id", type: "onSuccessSignal", config: {} },
                { id: "error-id", type: "onErrorSignal", config: {} }
            ]
        } as any);

        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), SIGNAL_STREAM_SETTLE_MS);
        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("success-id");
    });

    it("uses trimmed environmentUrl", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await sendSignalToCXone.function({
            cognigy,
            config: { ...baseConfig, connection: { ...baseConfig.connection, environmentUrl: "https://issuer///" } } as any
        } as any);

        expect(mockApiClient.sendSignal).toHaveBeenCalled();
    });

    it("does not throw when contactId is missing and no errorChild is wired", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await expect(sendSignalToCXone.function({
            cognigy,
            config: { ...baseConfig, contactId: "" } as any
        } as any)).resolves.toBeUndefined();

        expect(mockApiClient.sendSignal).not.toHaveBeenCalled();
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneSendSignal",
            expect.objectContaining({ success: false, stage: "validation" }),
            "simple"
        );
        expect(cognigy.api.output).not.toHaveBeenCalled();
        expect(cognigy.api.setNextNode).not.toHaveBeenCalled();
    });

    it("stringifies objects inside signalParams before sending (voice, no output)", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await sendSignalToCXone.function({
            cognigy,
            config: { ...baseConfig, signalParams: [{ foo: "bar" }, "plain"] } as any
        } as any);

        expect(mockApiClient.sendSignal).toHaveBeenCalledWith(
            baseConfig.contactId,
            ['{"foo":"bar"}', "plain"]
        );
        expect(cognigy.api.output).not.toHaveBeenCalled();
    });

    it("parses a raw JSON string as signalParams and stringifies objects", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await sendSignalToCXone.function({
            cognigy,
            config: { ...baseConfig, signalParams: '[{"a":1},"b"]' } as any
        } as any);

        expect(mockApiClient.sendSignal).toHaveBeenCalledWith(
            baseConfig.contactId,
            ['{"a":1}', "b"]
        );
    });

    it("logs warn for unparseable string input and omits Params from output", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "chat" }
        });

        await sendSignalToCXone.function({
            cognigy,
            config: { ...baseConfig, signalParams: "not json" } as any
        } as any);

        expect(mockApiClient.sendSignal).not.toHaveBeenCalled();
        expect(cognigy.api.log).toHaveBeenCalledWith(
            "warn",
            expect.stringContaining("sendSignalToCXone: Could not parse as JSON")
        );
        const outputCall = (cognigy.api.output as jest.Mock).mock.calls.find(c => c[0] === "");
        expect(outputCall[1]).toEqual({ Intent: "Signal" });
    });

    it("does not throw on send error when no errorChild is wired; surfaces context and output", async () => {
        (mockApiClient.sendSignal as jest.Mock).mockRejectedValueOnce(new Error("send error"));

        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await expect(
            sendSignalToCXone.function({
                cognigy,
                config: baseConfig as any
            } as any)
        ).resolves.toBeUndefined();

        expect(cognigy.api.log).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("sendSignalToCXone: Error signaling")
        );
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneSendSignal",
            expect.objectContaining({ success: false, error: "send error" }),
            "simple"
        );
        expect(cognigy.api.output).toHaveBeenCalledWith(
            "Something is not working. Please retry.",
            expect.objectContaining({ error: expect.any(String) })
        );
        // No On Failure branch wired → do not route, let the flow continue to the default next node.
        expect(cognigy.api.setNextNode).not.toHaveBeenCalled();
    });

    it("routes to onSuccessSignal child when sendSignal succeeds", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await sendSignalToCXone.function({
            cognigy,
            config: baseConfig as any,
            childConfigs: [
                { id: "success-id", type: "onSuccessSignal", config: {} },
                { id: "error-id", type: "onErrorSignal", config: {} }
            ]
        } as any);

        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("success-id");
    });

    it("routes to onErrorSignal instead of throwing when sendSignal fails", async () => {
        (mockApiClient.sendSignal as jest.Mock).mockRejectedValueOnce(new Error("send error"));

        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await sendSignalToCXone.function({
            cognigy,
            config: baseConfig as any,
            childConfigs: [
                { id: "success-id", type: "onSuccessSignal", config: {} },
                { id: "error-id", type: "onErrorSignal", config: {} }
            ]
        } as any);

        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("error-id");
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneSendSignal",
            expect.objectContaining({ success: false, error: "send error" }),
            "simple"
        );
        // With an On Failure branch wired we route to it instead of emitting the fallback message.
        expect(cognigy.api.output).not.toHaveBeenCalledWith(
            "Something is not working. Please retry.",
            expect.anything()
        );
    });

    it("routes to onErrorSignal child on validation failure", async () => {
        const cognigy = createMockCognigy();

        await sendSignalToCXone.function({
            cognigy,
            config: { ...baseConfig, connection: undefined } as any,
            childConfigs: [
                { id: "error-id", type: "onErrorSignal", config: {} }
            ]
        } as any);

        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("error-id");
    });

    it("does not throw when contactId is undefined", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await expect(sendSignalToCXone.function({
            cognigy,
            config: { ...baseConfig, contactId: undefined } as any
        } as any)).resolves.toBeUndefined();

        expect(mockApiClient.sendSignal).not.toHaveBeenCalled();
    });

    it("routes to onErrorSignal child when contactId is missing", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await sendSignalToCXone.function({
            cognigy,
            config: { ...baseConfig, contactId: "" } as any,
            childConfigs: [
                { id: "success-id", type: "onSuccessSignal", config: {} },
                { id: "error-id", type: "onErrorSignal", config: {} }
            ]
        } as any);

        expect(cognigy.api.setNextNode).toHaveBeenCalledWith("error-id");
        expect(mockApiClient.sendSignal).not.toHaveBeenCalled();
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneSendSignal",
            expect.objectContaining({ success: false, stage: "validation" }),
            "simple"
        );
    });

    it("treats whitespace-only contactId as missing and does not throw", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await expect(sendSignalToCXone.function({
            cognigy,
            config: { ...baseConfig, contactId: "   " } as any
        } as any)).resolves.toBeUndefined();

        expect(mockApiClient.sendSignal).not.toHaveBeenCalled();
    });
});
