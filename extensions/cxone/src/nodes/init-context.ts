import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { tryParseJsonField, normalizeIvaParams } from "../helpers/json-field.js";
import { redactContextData } from "../helpers/redact.js";

export interface IsetCxoneContextInitParams extends INodeFunctionBaseParams {
    config: {
        customerName?: string;
        ivaParams?: any;
        businessNumber?: string;
        flowId?: string;
    };
}

export const setCxoneContextInit = createNodeDescriptor({
    type: "setCxoneContextInit",
    defaultLabel: "Context Init",
    summary: "Set CXone settings in Cognigy Context for Chat and Voice",
     preview: {
        key: "customerName",
        type: "text"
    },
    fields: [
        {
            key: "customerName",
            label: "Fallback Customer Name",
            type: "cognigyText",
            description: "Fallback Customer Name to use if CXone parameters are not available."
        },
        {
            key: "businessNumber",
            label: "Fallback Business Number",
            type: "cognigyText",
            description: "Fallback Business Number to use if CXone parameters are not available."
        },
        {
            key: "flowId",
            label: "Optional: Fallback Flow ID",
            type: "cognigyText",
            description: "Fallback Flow ID to use if CXone parameters are not available."
        },
        {
            key: "ivaParams",
            label: "Optional: Fallback Custom IVA JSON",
            type: "json",
            description: "Fallback IVA Parameters (JSON) to use if CXone parameters are not available.",
            defaultValue: "{}"
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "customerName" },
        { type: "field", key: "businessNumber" },
        { type: "field", key: "flowId" },
        { type: "field", key: "ivaParams" }
    ],
    appearance: {
        color: "#3694FD"
    },
    function: async ({ cognigy, config: rawConfig }: INodeFunctionBaseParams) => {
        const { api, input, context } = cognigy;
        const { customerName, ivaParams, businessNumber, flowId } = rawConfig as IsetCxoneContextInitParams["config"];

        // Check if context data already exists - to not re-initialize
        if (context.data && context.data.contactId) {
            api.log?.("info", "setCxoneContextInit: Context data already exists, skipping initialization.");
            return;
        }

        try {
            const channel = input?.channel || '';
            api.log?.("info", `setCxoneContextInit: Interaction channel: ${channel}`);
            const isVoice = channel.toLowerCase().includes('voice');
            api.log?.("info", `setCxoneContextInit: isVoice: ${isVoice}`);

            if (isVoice) {
                const payload = input?.data?.payload;
                if (!payload) {
                    api.log?.("error", "setCxoneContextInit: Voice input data not available");
                    api.addToContext?.("setCxoneContextInit", "Voice input data not available", "simple");
                    return;
                }
                const headers = payload?.sip?.headers || {};

                let xCXone: Record<string, any> = {};
                let xCXoneCustom: Record<string, any> = {};
                let xCXoneExtended: Record<string, any> = {};

                try {
                    if (headers["X-CXone"]) {
                        xCXone = JSON.parse(headers["X-CXone"]);
                    }
                    if (headers["X-CXone-Custom"] && headers["X-CXone-Custom"].length > 7) {
                        const parsed = {
                            "ivaParams": {}
                        };
                        try {
                            const parsedHeader = JSON.parse(headers["X-CXone-Custom"]);
                            if ("ivaParams" in parsedHeader) {
                                // accepts a JSON string, an already parsed object, or { value: "<json>" }
                                parsed.ivaParams = normalizeIvaParams(api, parsedHeader.ivaParams);
                            }
                        } catch {
                            api.log?.("warn", "setCxoneContextInit: Failed to parse X-CXone-Custom header");
                        }
                        xCXoneCustom = parsed;
                    }
                    if (headers["X-CXone-Extended"] && headers["X-CXone-Extended"].length > 7) {
                        try {
                            xCXoneExtended = JSON.parse(headers["X-CXone-Extended"]);
                        } catch {
                            api.log?.("warn", "setCxoneContextInit: Failed to parse X-CXone-Extended header");
                        }
                    }
                } catch (err: any) {
                    api.log?.("error", "setCxoneContextInit: Error parsing X-CXone headers: " + err.message);
                }

                // Merge everything into contextData
                const contextData: Record<string, any> = {
                    ivaParams: {}, // default first, so the spreads below override it when they carry a value
                    ...xCXoneExtended,
                    ...xCXone,
                    ...xCXoneCustom,
                    flowChannel: "VOICE"
                };
                // trimmed at the source: a SIP header value can carry whitespace, and these IDs end up
                // in CXone API URLs and in the TMS payload
                if (headers["X-InContact-MasterId"]) {
                    contextData.contactId = headers["X-InContact-MasterId"].toString().trim();
                }
                if (headers["X-InContact-ContactId"]) {
                    contextData.spawnedContactId = headers["X-InContact-ContactId"].toString().trim();
                }

                // Add to context for voice
                api.log?.("info", `setCxoneContextInit: Setting context data for channel ${channel} (ani redacted): ${JSON.stringify(redactContextData(contextData))}`);
                api.addToContext?.("data", contextData, "simple");
            } else if (input.data && input.data.contactId) {
                // Add to context for chat - copied rather than mutated in place, and ivaParams always exists
                const chatData: Record<string, any> = { ivaParams: {}, ...input.data };
                if (input.data.ivaParams) {
                    chatData.ivaParams = normalizeIvaParams(api, input.data.ivaParams);
                }
                api.log?.("info", `setCxoneContextInit: Setting context data for channel ${channel} (ani redacted): ${JSON.stringify(redactContextData(chatData))}`);
                api.addToContext?.("data", chatData, "simple");
            } else {
                 const mData = {
                    "agentId": "",
                    "ani": '',
                    "contactId": '100000000000',
                    "copilot": "",
                    "customerName": "Our Company",
                    "digitalSkillId": "",
                    "flowChannel": "TESTCHAT",
                    "flowId": "",
                    "invocationId": "100000000000",
                    "ivaParams": {},
                    "ocpSessionId": "1000000:100000000000",
                    "spawnedContactId": "100000000000",
                    "voiceSkillId": ""
                };
                if (customerName) mData.customerName = customerName.trim();
                if (flowId) mData.flowId = flowId.trim();
                // the json field can arrive as an object or as a JSON string; an invalid value is ignored
                const parsedIvaParams = tryParseJsonField(api, ivaParams, "setCxoneContextInit: Fallback Custom IVA JSON");
                if (parsedIvaParams && typeof parsedIvaParams === "object" && Object.keys(parsedIvaParams).length > 0) {
                    mData.ivaParams = parsedIvaParams;
                }
                if (businessNumber) mData.ocpSessionId = `${businessNumber.trim()}:100000000000`;

                api.log?.("info", `setCxoneContextInit: No valid data found in input for channel ${channel}. Initializing with data (ani redacted): ${JSON.stringify(redactContextData(mData))}`);
                api.addToContext?.("data", mData, "simple");
            }
        } catch (error: any) {
            api.log?.("error", `setCxoneContextInit: Error setting context: ${error.message}`);
            api.addToContext?.("setCxoneContextInit", `Error setting context: ${error.message}`, 'simple');
        }
    }
});
