import { createNodeDescriptor } from "@cognigy/extension-tools";
import { SendSignalNodeParams } from "../types";
import { CXoneApiClient } from "../api/cxone-api-client";
import { isVoiceChannel } from "../helpers/channel-utils";
import { validateConnection, normalizeEnvironmentUrl } from "../config";
import { createErrorMessage } from "../helpers/errors";

export const sendSignalToCXone = createNodeDescriptor({
    type: "sendCxoneSignal",
    defaultLabel: "Signal Interaction",
    summary: "Signal CXone with arbitrary parameters",
    preview: {
        key: "contactId",
        type: "text"
    },
    fields: [
        {
            key: "connection",
            label: "CXone Connection",
            type: "connection",
            description: "Select the CXone connection to use, or create one.",
            params: {
                connectionType: "cxoneConnection",
                required: true
            }
        },
        {
            key: "contactId",
            label: "Contact ID",
            type: "cognigyText",
            description: "The CXone Contact ID.",
            params: {
                required: true
            }
        },
        {
            key: "signalParams",
            label: "Signal Parameters",
            type: "json",
            defaultValue: "[]",
            description: "Parameters to include in signal. Provide parameter values as an array of strings.",
            params: {
                required: true
            }
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "contactId" },
        { type: "field", key: "connection" },
        { type: "field", key: "signalParams" }
    ],
    appearance: {
        color: "#3694FD"
    },
    function: async ({ cognigy, config }: SendSignalNodeParams) => {
        const { contactId, signalParams, connection } = config;
        const { api, input, context } = cognigy;

        // Validate connection
        const connectionValidation = validateConnection(connection);
        if (!connectionValidation.valid) {
            throw new Error(createErrorMessage("sendSignalToCXone", "Validation", connectionValidation.error || "Invalid connection"));
        }

        // Validate signalParams
        if (!Array.isArray(signalParams)) {
            throw new Error(createErrorMessage("sendSignalToCXone", "Validation", "signalParams must be an array"));
        }

        const tokenIssuer = normalizeEnvironmentUrl(connection.environmentUrl);

        api.log("info", `sendSignalToCXone: Contact ID: ${contactId}; Environment URL: ${tokenIssuer}`);

        try {
            const channel = input?.channel || "";
            api.log("info", `sendSignalToCXone: Interaction channel: ${channel}`);
            const isVoice = isVoiceChannel(input);
            api.log("info", `sendSignalToCXone: isVoice: ${isVoice}`);

            // Handle voice channel signaling
            if (contactId && isVoice) {
                const apiClient = new CXoneApiClient(api, context, connection);
                const signalStatus = await apiClient.sendSignal(contactId, signalParams || []);
                api.log("info", `sendSignalToCXone: sent signal to CXone for contactId: ${contactId}; status: ${signalStatus}`);
                api.addToContext("CXoneSendSignal", `CXone was Signaled for contactId: ${contactId}, with parameters: ${JSON.stringify(signalParams)}`, "simple");
            }

            // Data for CXone chat channel
            const data: { Intent: string; Params?: string } = {
                Intent: "Signal"
            };
            if (Array.isArray(signalParams) && signalParams.length) {
                data.Params = signalParams.join("|");
            }
            api.output(null, data);
        } catch (error: any) {
            const errorMessage = error.message || "Unknown error";
            api.log("error", `sendSignalToCXone: Error signaling '${JSON.stringify(signalParams)}' for contactId: ${contactId}; error: ${errorMessage}`);
            api.addToContext("CXoneSendSignal", `Error signaling '${JSON.stringify(signalParams)}' for contactId: ${contactId}; error: ${errorMessage}`, "simple");
            api.output("Something is not working. Please retry.", { error: errorMessage });
            throw error;
        }
    }
});
