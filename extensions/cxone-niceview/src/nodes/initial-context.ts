import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getNiCEviewData } from "../helpers/services";

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
            api.log("info", `setNiCEviewContextInit: Interaction channel: ${channel}`);
            const isVoice = channel.toLowerCase().includes('voice');
            api.log("info", `setNiCEviewContextInit: isVoice: ${isVoice}`);

            if (isVoice) {
                const payload = input?.data?.payload;
                if (!payload) {
                    api.log("error", "setNiCEviewContextInit: Voice input data not available after waiting");
                    api.addToContext("setNiCEviewContextInit", "Voice input data not available", "simple");
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
                                if (parsedHeader.ivaParams.trim() !== "") {
                                    try {
                                        parsed.ivaParams = JSON.parse(parsedHeader.ivaParams);
                                    } catch {
                                        parsed.ivaParams = {};
                                    }
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
                    api.log("error", "setNiCEviewContextInit: Error parsing X-NiCEview headers: " + err.message);
                }

                // Merge everything into contextData
                const contextData: Record<string, any> = {
                    ...xNiceviewExtended,
                    ...xNiceview,
                    ...xNiceviewCustom,
                    flowChannel: "VOICE"
                };

                // if parameters are missing from sip headers - try getting them from NiCEview service call
                if (isParamsMissing) {
                    if (xNiceview.userToken && xNiceview.demoName) {
                        try {
                            api.log("info", "setNiCEviewContextInit: SIP Headers data missing. Retreiving from settings from NiCEview...");
                            const niceViewData = await getNiCEviewData(api, xNiceview.userToken.trim(), xNiceview.demoName.trim(), false);
                            let ivaParams = {};
                            try {
                                ivaParams = JSON.parse(niceViewData.customIvaJson);
                            } catch (err) {
                                api.log("warn", `setNiCEviewContextInit: Failed to parse customIvaJson: ${err.message}`);
                                ivaParams = {};
                            }

                            contextData.agentId = niceViewData.agentId || contextData.agentId;
                            contextData.ani = niceViewData.ani || contextData.ani;
                            contextData.contactId = niceViewData.contactId || contextData.contactId;
                            contextData.copilot = niceViewData.copilot || contextData.copilot;
                            contextData.customerName = niceViewData.customerName || contextData.customerName;
                            contextData.digitalSkillId = niceViewData.digitalSkillId || contextData.digitalSkillId;
                            contextData.flowId = niceViewData.flowId || contextData.flowId;
                            contextData.invocationId = niceViewData.invocationId || contextData.invocationId;
                            contextData.ivaParams = ivaParams;
                            contextData.ocpSessionId = niceViewData.ocpSessionId || contextData.ocpSessionId;
                            contextData.voiceSkillId = niceViewData.voiceSkillId || contextData.voiceSkillId;
                        } catch (error) {
                            api.log("error", `setNiCEviewContextInit: Error getting data from NiCEview service: ${error.message}`);
                        }
                    }
                }

                if (headers["X-InContact-MasterId"]) {
                    contextData.contactId = headers["X-InContact-MasterId"].toString();
                }
                if (headers["X-InContact-ContactId"]) {
                    contextData.spawnedContactId = headers["X-InContact-ContactId"].toString();
                }

                // Add to context for voice
                api.log("info", `setNiCEviewContextInit: Setting context data for channel ${channel}: ${JSON.stringify(contextData)}`);
                api.addToContext("data", contextData, "simple");
            } else if (input.data && typeof input.data === "object") {
                // Add to context for chat
                if (input.data.ivaParams) {
                    try {
                        input.data.ivaParams = JSON.parse(input.data.ivaParams);
                    } catch {
                        input.data.ivaParams = {};
                    }
                }
                api.log("info", `setNiCEviewContextInit: Setting context data for channel ${channel}: ${JSON.stringify(input.data)}`);
                api.addToContext("data", input.data, "simple");
            } else {
                api.log("info", `setNiCEviewContextInit: No valid data found in input for channel ${channel}`);
                api.addToContext("SetNiCEviewContextInit", `No valid data found in input for channel ${channel}`, 'simple');
            }
        } catch (error) {
            api.log("error", `setNiCEviewContextInit: Error setting context: ${error.message}`);
            api.addToContext("SetNiCEviewContextInit", `Error setting context: ${error.message}`, 'simple');
        }
    }
});