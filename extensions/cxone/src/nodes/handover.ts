import { createNodeDescriptor } from "@cognigy/extension-tools";
import transformConversation from "../helpers/tms-payload";
import { HandoverNodeParams, HandoverAction } from "../types";
import { CXoneApiClient } from "../api/cxone-api-client";
import { isVoiceChannel } from "../helpers/channel-utils";
import { SENTINEL_CONTACT_ID, HANDOVER_DELAY_MS, validateConnection, normalizeEnvironmentUrl } from "../config";
import { createErrorMessage } from "../helpers/errors";

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
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "action" },
        { type: "field", key: "businessNumber" },
        { type: "field", key: "contactId" },
        { type: "field", key: "spawnedContactId" },
        { type: "field", key: "connection" },
        { type: "field", key: "optionalParamsObject" }
    ],
    appearance: {
        color: "#3694FD"
    },
    function: async ({ cognigy, config }: HandoverNodeParams) => {
        const { action, businessNumber, contactId, spawnedContactId, connection, optionalParamsObject } = config;
        const { api, input, context } = cognigy;

        // Validate connection
        const connectionValidation = validateConnection(connection);
        if (!connectionValidation.valid) {
            throw new Error(createErrorMessage("handoverToCXone", "Validation", connectionValidation.error || "Invalid connection"));
        }

        // Validate action
        if (!action || (action !== "End" && action !== "Escalate")) {
            api.output("handoverToCXone Error: Missing or invalid Action parameter", { error: "Missing or invalid Action parameter" });
            throw new Error(createErrorMessage("handoverToCXone", "Validation", "Missing or invalid Action parameter"));
        }

        const tokenIssuer = normalizeEnvironmentUrl(connection.environmentUrl);

        api.log("info", `handoverToCXone: Contact ID: ${contactId}; Spawned Contact ID: ${spawnedContactId}; Action: ${action}; Environment URL: ${tokenIssuer}`);

        try {
            const channel = input?.channel || "";
            api.log("info", `handoverToCXone: Interaction channel: ${channel}`);
            const isVoice = isVoiceChannel(input);
            api.log("info", `handoverToCXone: isVoice: ${isVoice}`);

            // Prepare optional parameters
            let finalParams: string[] = [];
            if (Array.isArray(optionalParamsObject) && optionalParamsObject.length > 0) {
                finalParams = [JSON.stringify(optionalParamsObject)];
            }
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
                api.addToContext("CXoneHandover", `Signaled CXone with: '${action}' for contactId: ${spawnedContactId || contactId}`, "simple");
            }

            // Output the handover action to NiCE channel for CXone Guide Chat
            if (!isVoice && contactId && contactId !== SENTINEL_CONTACT_ID) {
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
                api.log("info", `handoverToCXone: Done. No output data sent to Voice / Cognigy Webchat / Cognigy Testchat channel.`);
            }

            // Wait before returning control to avoid unwanted messages during handover
            await new Promise(resolve => setTimeout(resolve, HANDOVER_DELAY_MS));
            return;
        } catch (error: any) {
            const errorMessage = error.message || "Unknown error";
            api.log("error", `handoverToCXone: Error signaling CXone with: '${action}' for contactId: ${spawnedContactId || contactId}; error: ${errorMessage}`);
            api.addToContext("CXoneHandover", `Error signaling CXone with: '${action}' for contactId: ${spawnedContactId || contactId}; error: ${errorMessage}`, "simple");
            api.output("Something is not working. Please retry.", { error: errorMessage });
            throw error;
        }
    }
});
