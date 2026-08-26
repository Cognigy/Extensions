import { createNodeDescriptor } from "@cognigy/extension-tools";
import { SendSignalNodeParams } from "../types";
import { CXoneApiClient } from "../api/cxone-api-client";
import { isVoiceChannel } from "../helpers/channel-utils";
import { validateConnection, normalizeEnvironmentUrl, SIGNAL_STREAM_SETTLE_MS } from "../config";
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

        // Let fire-and-forget api.* writes drain to the runtime's gRPC stream before
        // this function returns. The api methods are void (no Promise to await), so a
        // short settle is the only way to avoid the runtime ending the stream while a
        // write is still in flight ("13 INTERNAL: Write error: write after end").
        const settle = () => new Promise<void>(resolve => setTimeout(resolve, SIGNAL_STREAM_SETTLE_MS));

        // Best-effort diagnostic writes that must never block routing to On Failure.
        const safe = (fn: () => void) => {
            try {
                fn();
            } catch {
                /* never let a logging/context write prevent routing */
            }
        };

        // Validate connection
        const connectionValidation = validateConnection(connection);
        if (!connectionValidation.valid) {
            const msg = connectionValidation.error || "Invalid connection";
            safe(() => api.log("error", createErrorMessage("sendSignalToCXone", "Validation", msg)));
            safe(() => api.addToContext("CXoneSendSignal", { success: false, stage: "validation", error: msg }, "simple"));
            // No errorChild → routeTo no-ops and the flow continues to the default next node.
            await settle();
            routeTo(errorChild);
            return;
        }

        // Validate contactId
        if (!contactId || (typeof contactId === "string" && contactId.trim() === "")) {
            const msg = "Contact ID is required";
            safe(() => api.log("error", createErrorMessage("sendSignalToCXone", "Validation", msg)));
            safe(() => api.addToContext("CXoneSendSignal", { success: false, stage: "validation", error: msg }, "simple"));
            await settle();
            routeTo(errorChild);
            return;
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

            if (contactId && isVoice) {
                // Voice: the signal is delivered via the API call. No chat output is
                // emitted here — an empty-text output on voice is meaningless and its
                // deferred gRPC write is what races the stream end ("write after end").
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
                // Chat: the signal is delivered as output data on the NiCE CXone channel.
                const data: { Intent: string; Params?: string } = {
                    Intent: "Signal"
                };
                if (finalParams.length) {
                    data.Params = finalParams.join("|");
                }
                api.output("", data);
                api.addToContext("CXoneSendSignal", {
                    success: true,
                    contactId,
                    params: finalParams,
                    note: "chat-channel output only"
                }, "simple");
            }

            // Flush pending writes before ending the stream, then route.
            await settle();
            routeTo(successChild);
            return;
        } catch (error: any) {
            const errorMessage = error.message || "Unknown error";
            safe(() => api.log("error", `sendSignalToCXone: Error signaling '${JSON.stringify(finalParams)}' for contactId: ${contactId}; error: ${errorMessage}`));
            safe(() => api.addToContext("CXoneSendSignal", {
                success: false,
                contactId,
                params: finalParams,
                error: errorMessage
            }, "simple"));

            // No On Failure branch wired up — surface a brief message but never throw,
            // so the flow continues to the default next node instead of halting.
            if (!errorChild) {
                safe(() => api.output("Something is not working. Please retry.", { error: errorMessage }));
            }

            await settle();
            routeTo(errorChild);
            return;
        }
    }
});
