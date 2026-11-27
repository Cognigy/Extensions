import { createNodeDescriptor } from "@cognigy/extension-tools";
import transformConversation from "../helpers/tms-payload";
import { HandoverNodeParams, HandoverAction } from "../types";
import { CXoneApiClient } from "../api/cxone-api-client";
import { isVoiceChannel } from "../helpers/channel-utils";
import { SENTINEL_CONTACT_ID, HANDOVER_DELAY_MS, SIGNAL_STREAM_SETTLE_MS, validateConnection, normalizeEnvironmentUrl } from "../config";
import { createErrorMessage } from "../helpers/errors";
import { prepareParams } from "../helpers/params";

const ON_SUCCESS_CHILD = "onSuccessHandover";
const ON_ERROR_CHILD = "onErrorHandover";

export const handoverToCXone = createNodeDescriptor({
    type: "handoverToCXone",
    defaultLabel: "Exit Interaction",
    summary: "Escalate to Agent or End Conversation by returning control to CXone. Send transcript to TMS.",
    preview: {
        key: "action",
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
            key: "action",
            label: "Exit Action",
            type: "select",
            description: "Select the action to perform.",
            params: {
                options: [
                    { label: "Escalate to Agent", value: "Escalate" },
                    { label: "End Conversation", value: "End" }
                ],
                required: true
            }
        },
        {
            key: "businessNumber",
            label: "Business Unit Number",
            type: "cognigyText",
            description: "The CXone Business Unit Number.",
            params: {
                required: true
            }
        },
        {
            key: "contactId",
            label: "Main Contact ID",
            type: "cognigyText",
            description: "The CXone Main Contact ID.",
            params: {
                required: true
            }
        },
        {
            key: "spawnedContactId",
            label: "Spawned Contact ID",
            type: "cognigyText",
            description: "The CXone Spawned Contact ID.",
            params: {
                required: true
            }
        },
        {
            key: "optionalParamsObject",
            label: "Parameters (optional): Array of JSON Objects",
            type: "json",
            description: "Provide an array of JSON objects to be sent to CXone.",
            defaultValue: "[]",
            params: {
                required: false
            }
        },
        {
            key: "setEscalationFlag",
            label: "Set Escalation Analytics Field",
            type: "toggle",
            description: "On a successful Escalate, automatically write the Handover Escalations flag to the Cognigy analytics data (replaces a manual Overwrite Analytics node). Best effort: a failure never affects the flow.",
            defaultValue: false
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "action" },
        { type: "field", key: "businessNumber" },
        { type: "field", key: "contactId" },
        { type: "field", key: "spawnedContactId" },
        { type: "field", key: "connection" },
        { type: "field", key: "optionalParamsObject" },
        { type: "field", key: "setEscalationFlag" }
    ],
    appearance: {
        color: "#3694FD"
    },
    dependencies: {
        children: [ON_SUCCESS_CHILD, ON_ERROR_CHILD]
    },
    function: async ({ cognigy, config, childConfigs }: HandoverNodeParams) => {
        const { action, businessNumber, contactId, spawnedContactId, connection, optionalParamsObject, setEscalationFlag } = config;
        const { api, input, context } = cognigy;

        const successChild = childConfigs?.find(c => c.type === ON_SUCCESS_CHILD);
        const errorChild = childConfigs?.find(c => c.type === ON_ERROR_CHILD);

        // Best-effort api.* writes that must never turn into an unhandled throw. On a
        // closing gRPC connection any api call can throw ("1 CANCELLED: grpc: the
        // client connection is closing") — an unhandled throw here halts the whole
        // flow with no way to reach On Failure.
        const safe = (fn: () => void) => {
            try {
                fn();
            } catch {
                /* never let a logging/context/routing write halt the flow */
            }
        };

        const routeTo = (child?: { id: string }) => {
            if (child && typeof api.setNextNode === "function") {
                safe(() => api.setNextNode(child.id));
            }
        };

        // Let fire-and-forget api.* writes drain to the runtime's gRPC stream before
        // this function returns (see SIGNAL_STREAM_SETTLE_MS).
        const settle = () => new Promise<void>(resolve => setTimeout(resolve, SIGNAL_STREAM_SETTLE_MS));

        // No errorChild → routeTo no-ops and the flow continues to the default next node.
        const failValidation = async (msg: string) => {
            safe(() => api.log("error", createErrorMessage("handoverToCXone", "Validation", msg)));
            safe(() => api.addToContext("CXoneHandover", { success: false, stage: "validation", error: msg }, "simple"));
            await settle();
            routeTo(errorChild);
        };

        const connectionValidation = validateConnection(connection);
        if (!connectionValidation.valid) {
            await failValidation(connectionValidation.error || "Invalid connection");
            return;
        }
        if (!action || (action !== "End" && action !== "Escalate")) {
            await failValidation("Missing or invalid Action parameter");
            return;
        }
        if (!contactId || (typeof contactId === "string" && contactId.trim() === "")) {
            await failValidation("Contact ID is required");
            return;
        }
        if (!spawnedContactId || (typeof spawnedContactId === "string" && spawnedContactId.trim() === "")) {
            await failValidation("Spawned Contact ID is required");
            return;
        }

        try {
            const tokenIssuer = normalizeEnvironmentUrl(connection.environmentUrl);
            api.log("info", `handoverToCXone: Contact ID: ${contactId}; Spawned Contact ID: ${spawnedContactId}; Action: ${action}; Environment URL: ${tokenIssuer}`);

            const channel = input?.channel || "";
            api.log("info", `handoverToCXone: Interaction channel: ${channel}`);
            const isVoice = isVoiceChannel(input);
            // The Interactions Panel can't render CXone Guide Chat payloads — sending
            // one there shows "invalid data" to the tester.
            const isInteractionsPanel = channel.toLowerCase() === "adminconsole";
            api.log("info", `handoverToCXone: isVoice: ${isVoice}`);

            // Prepare optional parameters
            const finalParams = prepareParams(optionalParamsObject, api.log, "handoverToCXone");
            api.log("info", `handoverToCXone: prepared optional parameters: ${JSON.stringify(finalParams)}`);

            // Handle voice channel handover
            if (contactId && spawnedContactId && isVoice && contactId !== SENTINEL_CONTACT_ID && spawnedContactId !== SENTINEL_CONTACT_ID) {
                const apiClient = new CXoneApiClient(api, context, connection);

                // Send transcript to TMS if available
                const transcript = input.transcript || context.transcript || "";
                if (transcript && Array.isArray(transcript) && transcript.length > 0) {
                    api.log("info", `handoverToCXone: got transcript`);
                    try {
                        const tmsPayload = transformConversation(transcript, action as HandoverAction, contactId, businessNumber);
                        api.log("info", `handoverToCXone: transformed transcript to TMS payload: ${JSON.stringify(tmsPayload)}`);
                        const tmsStatus = await apiClient.postTranscript(tmsPayload);
                        api.log("info", `handoverToCXone: posted transcript to TMS for contactId: ${contactId}; status: ${tmsStatus}`);
                    } catch (tmsError: any) {
                        api.log("error", `handoverToCXone: Error posting transcript to TMS for contactId: ${contactId}; error: ${tmsError.message}`);
                    }
                }

                // Send handover signal
                const signalStatus = await apiClient.sendSignalHandover(
                    spawnedContactId || contactId,
                    action as HandoverAction,
                    finalParams
                );
                api.log("info", `handoverToCXone: sent signal to CXone for contactId: ${spawnedContactId || contactId}; action: ${action}; status: ${signalStatus}`);
                api.addToContext("CXoneHandover", {
                    success: true,
                    action,
                    contactId: spawnedContactId || contactId,
                    status: signalStatus
                }, "simple");
            }

            // Output the handover action to NiCE channel for CXone Guide Chat
            if (!isVoice && !isInteractionsPanel && contactId && contactId !== SENTINEL_CONTACT_ID) {
                const ndata: {
                    _cognigy: {
                        _niceCXOne: {
                            json: {
                                text: string;
                                uiComponent: Record<string, unknown>;
                                data: {
                                    Intent: string;
                                    Params?: string;
                                };
                                action: string;
                            };
                        };
                    };
                } = {
                    _cognigy: {
                        _niceCXOne: {
                            json: {
                                text: "",
                                uiComponent: {},
                                data: {
                                    Intent: action
                                },
                                action: action === "End" ? "END_CONVERSATION" : "AGENT_TRANSFER"
                            }
                        }
                    }
                };

                if (Array.isArray(finalParams) && finalParams.length) {
                    ndata._cognigy._niceCXOne.json.data.Params = finalParams.join("|");
                }
                api.output("", ndata);
                api.log("info", `handoverToCXone: Done. Output data was sent to CXone Guide Chat channel: ${JSON.stringify(ndata)}`);
            } else {
                if (isInteractionsPanel) {
                    // Simulated success: nothing is sent to CXone from the Interactions
                    // Panel, so tell the tester explicitly instead of only logging it.
                    const note = `Exit Interaction (${action}): simulated success — Interactions Panel test, no signal was sent to CXone.`;
                    safe(() => {
                        // logDebugMessage shows in the panel's debug mode; not in the SDK
                        // types and possibly not forwarded to extensions → fall back to a
                        // plain output bubble.
                        const anyApi = api as any;
                        if (typeof anyApi.logDebugMessage === "function") {
                            anyApi.logDebugMessage(note, "CXone Exit Interaction");
                        } else {
                            api.output(note, null);
                        }
                    });
                }
                api.log("info", `handoverToCXone: Done. No output data sent to Voice / Interactions Panel channel.`);
            }

            // Best-effort bonus: mirror the Overwrite Analytics "Handover Escalations"
            // field so containment dashboards work without a manual node in the flow.
            // No documented extension API exists for analytics — addToInput is the
            // documented input-object write, analyticsdata mutation is the Code Node
            // convention; either may silently not reach analytics. Must never break
            // the node, so everything stays inside safe().
            if (setEscalationFlag && action === "Escalate") {
                safe(() => {
                    const key = "handoverEscalations";
                    const anyApi = api as any;
                    const anyInput = input as any;
                    const value = (Number(anyInput?.analyticsdata?.[key]) || 0) + 1;
                    if (typeof anyApi.addToInput === "function") {
                        anyApi.addToInput(key, value);
                    }
                    if (anyInput?.analyticsdata && typeof anyInput.analyticsdata === "object") {
                        anyInput.analyticsdata[key] = value;
                    }
                    api.log("info", `handoverToCXone: best-effort escalation analytics field '${key}' set to ${value}`);
                });
            }

            // Wait before returning control to avoid unwanted messages during handover
            // (also lets pending fire-and-forget writes drain before the stream ends)
            await new Promise(resolve => setTimeout(resolve, HANDOVER_DELAY_MS));

            routeTo(successChild);
            return;
        } catch (error: any) {
            const errorMessage = error?.message || "Unknown error";
            safe(() => api.log("error", `handoverToCXone: Error signaling CXone with: '${action}' for contactId: ${spawnedContactId || contactId}; error: ${errorMessage}`));
            safe(() => api.addToContext("CXoneHandover", {
                success: false,
                action,
                contactId: spawnedContactId || contactId,
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
