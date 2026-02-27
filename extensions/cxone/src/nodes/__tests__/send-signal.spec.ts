/// <reference types="jest" />

import { sendSignalToCXone } from "../send-signal";
import { createMockCognigy } from "../../test-utils/mockCognigyApi";

jest.mock("../../api/cxone-api-client");

import { CXoneApiClient } from "../../api/cxone-api-client";

describe("sendSignalToCXone node", () => {
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
        // Mock the API client
        mockApiClient = {
            sendSignal: jest.fn().mockResolvedValue(204)
        } as any;

        (CXoneApiClient as jest.MockedClass<typeof CXoneApiClient>).mockImplementation(() => mockApiClient);

        jest.clearAllMocks();
    });

    it("signals CXone for voice channel", async () => {
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
            expect.stringContaining("CXone was Signaled"),
            "simple"
        );
        // Output for chat channel is always emitted
        expect(cognigy.api.output).toHaveBeenCalledWith(
            null,
            expect.objectContaining({
                Intent: "Signal",
                Params: "one|two"
            })
        );
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

    it("does not call sendSignal when contactId missing", async () => {
        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await sendSignalToCXone.function({
            cognigy,
            config: { ...baseConfig, contactId: "" } as any
        } as any);

        expect(mockApiClient.sendSignal).not.toHaveBeenCalled();
        expect(cognigy.api.output).toHaveBeenCalledWith(
            null,
            expect.objectContaining({ Intent: "Signal" })
        );
    });

    it("handles errors from helpers and surfaces context and output", async () => {
        (mockApiClient.sendSignal as jest.Mock).mockRejectedValueOnce(new Error("send error"));

        const cognigy = createMockCognigy({
            input: { channel: "voice" }
        });

        await expect(
            sendSignalToCXone.function({
                cognigy,
                config: baseConfig as any
            } as any)
        ).rejects.toThrow("send error");

        expect(cognigy.api.log).toHaveBeenCalledWith(
            "error",
            expect.stringContaining("sendSignalToCXone: Error signaling")
        );
        expect(cognigy.api.addToContext).toHaveBeenCalledWith(
            "CXoneSendSignal",
            expect.stringContaining("Error signaling"),
            "simple"
        );
        expect(cognigy.api.output).toHaveBeenCalledWith(
            "Something is not working. Please retry.",
            expect.objectContaining({ error: expect.any(String) })
        );
    });
});
