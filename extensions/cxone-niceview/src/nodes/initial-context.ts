import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getNiCEviewData } from "../helpers/services";
import { redactContextData } from "../helpers/redact";
import { fillMissingAni } from "../helpers/ani";

export const setNiCEviewContextInit = createNodeDescriptor({
    type: "setNiCEviewContextInit",
    defaultLabel: "NiCEview Init",
    summary: "Set NiCEview demo settings in Cognigy Context for Chat and Voice",
    fields: [],
    sections: [],
    form: [],
    appearance: {
        color: "#A060F1"
    },
    function: async ({ cognigy }: INodeFunctionBaseParams) => {
        const { api, input, context } = cognigy;

        try {
            const channel = input?.channel || '';
            api.log?.("info", `setNiCEviewContextInit: Interaction channel: ${channel}`);
            const isVoice = channel.toLowerCase().includes('voice');
            api.log?.("info", `setNiCEviewContextInit: isVoice: ${isVoice}`);

            if (isVoice) {
                const payload = input?.data?.payload;
                if (!payload) {
                    api.log?.("error", "setNiCEviewContextInit: Voice input data not available");
                    api.addToContext?.("setNiCEviewContextInit", "Voice input data not available", "simple");
                    return;
                }
                const headers = payload?.sip?.headers || {};

                let xNiceview: Record<string, any> = {};
                let xNiceviewCustom: Record<string, any> = {};
                let xNiceviewExtended: Record<string, any> = {};

                let isParamsMissing = false;

                try {
                    if (headers["X-NiCEview"]) {
                        xNiceview = JSON.parse(headers["X-NiCEview"]);
                    }
                    if (headers["X-NiCEview-Custom"] && headers["X-NiCEview-Custom"].length > 7) {
                        const parsed = {
                            "ivaParams": {}
                        };
                        try {
                            const parsedHeader = JSON.parse(headers["X-NiCEview-Custom"]);
                            if ("ivaParams" in parsedHeader) {
                                // Some widget bundles wrap a string ivaParams as {value: "<json>"}
                                // before serializing to the SIP header. Unwrap so we always work
                                // with either a string (legacy/patched widget) or an already-parsed
                                // object (newer payloads).
                                const rawIva = (parsedHeader.ivaParams
                                                && typeof parsedHeader.ivaParams === "object"
                                                && "value" in parsedHeader.ivaParams)
                                    ? parsedHeader.ivaParams.value
                                    : parsedHeader.ivaParams;

                                if (typeof rawIva === "string") {
                                    if (rawIva.trim() !== "") {
                                        try {
                                            parsed.ivaParams = JSON.parse(rawIva);
                                        } catch {
                                            parsed.ivaParams = {};
                                        }
                                    } else {
                                        parsed.ivaParams = {};
                                    }
                                } else if (rawIva && typeof rawIva === "object") {
                                    parsed.ivaParams = rawIva;
                                } else {
                                    parsed.ivaParams = {};
                                }
                            } else {
                                isParamsMissing = true;
                            }
                        } catch {
                            isParamsMissing = true;
                        }
                        xNiceviewCustom = parsed;
                    } else {
                        isParamsMissing = true;
                    }
                    if (headers["X-NiCEview-Extended"] && headers["X-NiCEview-Extended"].length > 7) {
                        try {
                            xNiceviewExtended = JSON.parse(headers["X-NiCEview-Extended"]);
                        } catch {
                            isParamsMissing = true;
                        }
                    } else {
                        isParamsMissing = true;
                    }
                } catch (err) {
                    api.log?.("error", "setNiCEviewContextInit: Error parsing X-NiCEview headers: " + (err as Error).message);
                }

                // Merge everything into contextData
                const contextData: Record<string, any> = {
                    ivaParams: {}, // default first, so the spreads below override it when they carry a value
                    ...xNiceviewExtended,
                    ...xNiceview,
                    ...xNiceviewCustom,
                    flowChannel: "VOICE"
                };

                // if parameters are missing from sip headers - try getting them from NiCEview service call
                if (isParamsMissing) {
                    if (xNiceview.userToken && xNiceview.demoName) {
                        try {
                            api.log?.("info", "setNiCEviewContextInit: SIP header data is incomplete. Retrieving settings from NiCEview...");
                            const niceViewData = await getNiCEviewData(api, xNiceview.userToken.trim(), xNiceview.demoName.trim(), false);

                            // Only override fields when the service actually returned a value —
                            // never clobber a good SIP-header value with `{}`/empty from a failed
                            // service call.
                            if (niceViewData) {
                                contextData.agentId         = niceViewData.agentId         || contextData.agentId;
                                contextData.ani             = niceViewData.ani             || contextData.ani;
                                contextData.contactId       = niceViewData.contactId       || contextData.contactId;
                                contextData.copilot         = niceViewData.copilot         || contextData.copilot;
                                contextData.customerName    = niceViewData.customerName    || contextData.customerName;
                                contextData.digitalSkillId  = niceViewData.digitalSkillId  || contextData.digitalSkillId;
                                contextData.flowId          = niceViewData.flowId          || contextData.flowId;
                                contextData.invocationId    = niceViewData.invocationId    || contextData.invocationId;
                                contextData.ocpSessionId    = niceViewData.ocpSessionId    || contextData.ocpSessionId;
                                contextData.voiceSkillId    = niceViewData.voiceSkillId    || contextData.voiceSkillId;

                                if (niceViewData.customIvaJson) {
                                    try {
                                        contextData.ivaParams = JSON.parse(niceViewData.customIvaJson);
                                    } catch (err) {
                                        api.log?.("warn", `setNiCEviewContextInit: Failed to parse customIvaJson: ${(err as Error).message}`);
                                    }
                                }
                            }
                        } catch (error) {
                            api.log?.("error", `setNiCEviewContextInit: Error getting data from NiCEview service: ${(error as Error).message}`);
                        }
                    }
                }

                // trimmed at the source: a SIP header value can carry whitespace, and these IDs end up
                // in CXone API URLs further down the flow
                if (headers["X-InContact-MasterId"]) {
                    contextData.contactId = headers["X-InContact-MasterId"].toString().trim();
                }
                if (headers["X-InContact-ContactId"]) {
                    contextData.spawnedContactId = headers["X-InContact-ContactId"].toString().trim();
                }

                // After the contact ids are final: a real call that arrived without an ani
                // gets one from elsewhere on the input, so the caller can still be numbered
                // Guest 1, Guest 2 instead of reading as a plain "Guest".
                const aniSource = fillMissingAni(input, contextData);
                if (aniSource) {
                    api.log?.("info", `setNiCEviewContextInit: ani was missing; source: ${aniSource}`);
                    api.addToContext?.("aniSource", aniSource, "simple");
                }

                // Add to context for voice
                api.log?.("info", `setNiCEviewContextInit: Setting context data for channel ${channel} (ani redacted): ${JSON.stringify(redactContextData(contextData))}`);
                api.addToContext?.("data", contextData, "simple");
            } else if (input.data && typeof input.data === "object") {
                // Add to context for chat - copied rather than mutated in place, and ivaParams always exists
                const chatData: Record<string, any> = { ivaParams: {}, ...input.data };
                if (typeof input.data.ivaParams === "string") {
                    try {
                        chatData.ivaParams = JSON.parse(input.data.ivaParams);
                    } catch {
                        chatData.ivaParams = {};
                    }
                } else if (input.data.ivaParams && typeof input.data.ivaParams === "object") {
                    chatData.ivaParams = input.data.ivaParams;
                }
                // Same ani back-fill as the voice branch: it is gated on flowChannel, so it only
                // does anything when a real telephony contact came in through this path.
                const aniSource = fillMissingAni(input, chatData);
                if (aniSource) {
                    api.log?.("info", `setNiCEviewContextInit: ani was missing; source: ${aniSource}`);
                    api.addToContext?.("aniSource", aniSource, "simple");
                }
                api.log?.("info", `setNiCEviewContextInit: Setting context data for channel ${channel} (ani redacted): ${JSON.stringify(redactContextData(chatData))}`);
                api.addToContext?.("data", chatData, "simple");
            } else {
                api.log?.("info", `setNiCEviewContextInit: No valid data found in input for channel ${channel}`);
                api.addToContext?.("setNiCEviewContextInit", `No valid data found in input for channel ${channel}`, 'simple');
            }
        } catch (error) {
            api.log?.("error", `setNiCEviewContextInit: Error setting context: ${(error as Error).message}`);
            api.addToContext?.("setNiCEviewContextInit", `Error setting context: ${(error as Error).message}`, 'simple');
        }
    }
});