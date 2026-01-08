import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

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
    function: async ({ cognigy, config }: IsetCxoneContextInitParams) => {
        const { api, input, context } = cognigy;
        const { customerName, ivaParams, businessNumber, flowId } = config;

        // Check if context data already exists - to not re-initialize
        if (context.data && context.data.contactId) {
            api.log("info", "setCxoneContextInit: Context data already exists, skipping initialization.");
            return;
        }

        try {
            const channel = input?.channel || '';
            api.log("info", `setCxoneContextInit: Interaction channel: ${channel}`);
            const isVoice = channel.toLowerCase().includes('voice');
            api.log("info", `setCxoneContextInit: isVoice: ${isVoice}`);

            if (isVoice) {
                const payload = input?.data?.payload;
                if (!payload) {
                    api.log("error", "setCxoneContextInit: Voice input data not available");
                    api.addToContext("setCxoneContextInit", "Voice input data not available", "simple");
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
                                if (parsedHeader.ivaParams.trim() !== "") {
                                    try {
                                        parsed.ivaParams = JSON.parse(parsedHeader.ivaParams);
                                    } catch {
                                        parsed.ivaParams = {};
                                    }
                                } else {
                                    parsed.ivaParams = {};
                                }
                            }
                        } catch {
                            api.log("warn", "setCxoneContextInit: Failed to parse X-CXone-Custom header");
                        }
                        xCXoneCustom = parsed;
                    }
                    if (headers["X-CXone-Extended"] && headers["X-CXone-Extended"].length > 7) {
                        try {
                            xCXoneExtended = JSON.parse(headers["X-CXone-Extended"]);
                        } catch {
                            api.log("warn", "setCxoneContextInit: Failed to parse X-CXone-Extended header");
                        }
                    }
                } catch (err) {
                    api.log("error", "setCxoneContextInit: Error parsing X-CXone headers: " + err.message);
                }

                // Merge everything into contextData
                const contextData: Record<string, any> = {
                    ...xCXoneExtended,
                    ...xCXone,
                    ...xCXoneCustom,
                    flowChannel: "VOICE"
                };
                if (headers["X-InContact-MasterId"]) {
                    contextData.contactId = headers["X-InContact-MasterId"].toString();
                }
                if (headers["X-InContact-ContactId"]) {
                    contextData.spawnedContactId = headers["X-InContact-ContactId"].toString();
                }

                // Add to context for voice
                api.log("info", `setCxoneContextInit: Setting context data for channel ${channel}: ${JSON.stringify(contextData)}`);
                api.addToContext("data", contextData, "simple");
            } else if (input.data && input.data.contactId) {
                // Add to context for chat
                if (input.data.ivaParams) {
                    try {
                        input.data.ivaParams = JSON.parse(input.data.ivaParams);
                    } catch {
                        input.data.ivaParams = {};
                    }
                }
                api.log("info", `setCxoneContextInit: Setting context data for channel ${channel}: ${JSON.stringify(input.data)}`);
                api.addToContext("data", input.data, "simple");
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
                if (ivaParams && typeof ivaParams === "object" && Object.keys(ivaParams).length > 0) mData.ivaParams = ivaParams;
                if (businessNumber) mData.ocpSessionId = `${businessNumber.trim()}:100000000000`;

                api.log("info", `setCxoneContextInit: No valid data found in input for channel ${channel}. Initializing with data: ${JSON.stringify(mData)}`);
                api.addToContext("data", mData, "simple");
            }
        } catch (error) {
            api.log("error", `setCxoneContextInit: Error setting context: ${error.message}`);
            api.addToContext("setCxoneContextInit", `Error setting context: ${error.message}`, 'simple');
        }
    }
});