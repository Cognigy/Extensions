import { createNodeDescriptor } from "@cognigy/extension-tools";
import { SendSignalNodeParams } from "../types";
import { CXoneApiClient } from "../api/cxone-api-client";
import { isVoiceChannel } from "../helpers/channel-utils";
import { validateConnection, normalizeEnvironmentUrl } from "../config";
import { createErrorMessage } from "../helpers/errors";
import { prepareParams } from "../helpers/params";

const ON_SUCCESS_CHILD = "onSuccessSignal";
const ON_ERROR_CHILD = "onErrorSignal";

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
            description: "Parameters to include in signal. Provide parameter values as an array of strings or objects (objects are JSON-stringified automatically).",
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
    dependencies: {
        children: [ON_SUCCESS_CHILD, ON_ERROR_CHILD]
    },
    function: async ({ cognigy, config, childConfigs }: SendSignalNodeParams) => {
        const { contactId, signalParams, connection } = config;
        const { api, input, context } = cognigy;

        const successChild = childConfigs?.find(c => c.type === ON_SUCCESS_CHILD);
        const errorChild = childConfigs?.find(c => c.type === ON_ERROR_CHILD);

        const routeTo = (child?: { id: string }) => {
            if (child && typeof api.setNextNode === "function") {
                api.setNextNode(child.id);
            }
        };

        // Validate connection
        const connectionValidation = validateConnection(connection);
        if (!connectionValidation.valid) {
            const msg = connectionValidation.error || "Invalid connection";
            api.log("error", createErrorMessage("sendSignalToCXone", "Validation", msg));
            api.addToContext("CXoneSendSignal", { success: false, stage: "validation", error: msg }, "simple");
            if (errorChild) {
                routeTo(errorChild);
                return;
            }
            throw new Error(createErrorMessage("sendSignalToCXone", "Validation", msg));
        }

        // Validate contactId
        if (!contactId || (typeof contactId === "string" && contactId.trim() === "")) {
            const msg = "Contact ID is required";
            api.log("error", createErrorMessage("sendSignalToCXone", "Validation", msg));
            api.addToContext("CXoneSendSignal", { success: false, stage: "validation", error: msg }, "simple");
            if (errorChild) {
                routeTo(errorChild);
                return;
            }
            throw new Error(createErrorMessage("sendSignalToCXone", "Validation", msg));
        }

        // Prepare signal parameters (accept array of strings/objects, or a raw JSON string)
        const finalParams = prepareParams(signalParams, api.log, "sendSignalToCXone");

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
                const signalStatus = await apiClient.sendSignal(contactId, finalParams);
                api.log("info", `sendSignalToCXone: sent signal to CXone for contactId: ${contactId}; status: ${signalStatus}`);
                api.addToContext("CXoneSendSignal", {
                    success: true,
                    contactId,
                    params: finalParams,
                    status: signalStatus
                }, "simple");
            } else {
                api.addToContext("CXoneSendSignal", {
                    success: true,
                    contactId,
                    params: finalParams,
                    note: "chat-channel output only"
                }, "simple");
            }

            // Data for CXone chat channel
            const data: { Intent: string; Params?: string } = {
                Intent: "Signal"
            };
            if (finalParams.length) {
                data.Params = finalParams.join("|");
            }
            api.output(null, data);

            routeTo(successChild);
        } catch (error: any) {
            const errorMessage = error.message || "Unknown error";
            api.log("error", `sendSignalToCXone: Error signaling '${JSON.stringify(finalParams)}' for contactId: ${contactId}; error: ${errorMessage}`);
            api.addToContext("CXoneSendSignal", {
                success: false,
                contactId,
                params: finalParams,
                error: errorMessage
            }, "simple");

            if (errorChild) {
                // Best-practices fallback: do not throw — let the On Failure branch run
                routeTo(errorChild);
                return;
            }

            // No onError branch wired up — preserve the original contract so flows
            // that relied on exception-based failure detection keep working.
            api.output("Something is not working. Please retry.", { error: errorMessage });
            throw error;
        }
    }
});
