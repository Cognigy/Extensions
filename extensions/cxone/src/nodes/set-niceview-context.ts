import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export const setNiCEviewContext = createNodeDescriptor({
    type: "setNiCEviewContext",
    defaultLabel: "NiCEview Context",
    summary: "Set NiCEview demo settings in Cognigy Context for Chat and Voice",
    preview: {
        key: "action",
        type: "text"
    },
    fields: [],
    sections: [],
    form: [],
    appearance: {
        color: "#A060F1"
    },
    function: async ({ cognigy }: INodeFunctionBaseParams) => {
        const { api, input, context } = cognigy;

        // api.log("info", `SetNiCEviewContext: Got input: ${JSON.stringify(input)}`);
        // api.log("info", `SetNiCEviewContext: Got context: ${JSON.stringify(context)}`);

        try {
            const channel = input?.channel || '';
            api.log("info", `SetNiCEviewContext: Interaction channel: ${channel}`);
            const isVoice = channel.toLowerCase().includes('voice');
            api.log("info", `SetNiCEviewContext: isVoice: ${isVoice}`);


            if (isVoice) {
                const payload = input?.data?.payload;
                if (!payload) {
                    api.log("error", "SetNiCEviewContext: Voice input data not available after waiting");
                    api.addToContext("SetNiCEviewContext", "Voice input data not available", "simple");
                    return;
                }
                const headers = payload?.sip?.headers || {};

                let xNiceview: Record<string, any> = {};
                let xNiceviewCustom: Record<string, any> = {};
                let xNiceviewExtended: Record<string, any> = {};
                const xSpawnedContactId: Record<string, any> = {};
                const xMasterContactId: Record<string, any> = {};

                try {
                    if (headers["X-NiCEview"]) {
                        xNiceview = JSON.parse(headers["X-NiCEview"]);
                    }
                    if (headers["X-NiCEview-Custom"]) {
                        const parsed = JSON.parse(headers["X-NiCEview-Custom"]);
                        if (parsed.ivaParams) {
                            try {
                                parsed.ivaParams = JSON.parse(parsed.ivaParams);
                            } catch {
                                parsed.ivaParams = "";
                            }
                        }
                        xNiceviewCustom = parsed;
                    }
                    if (headers["X-NiCEview-Extended"]) {
                        xNiceviewExtended = JSON.parse(headers["X-NiCEview-Extended"]);
                    }
                } catch (err) {
                    api.log("error", "SetNiCEviewContext: Error parsing X-NiCEview headers: " + err.message);
                }

                // Merge everything into contextData
                const contextData: Record<string, any> = {
                    ...xNiceviewExtended,
                    ...xNiceview,
                    ...xNiceviewCustom,
                    flowChannel: "VOICE"
                };

                if (headers["X-InContact-MasterId"]) {
                    contextData.contactId = headers["X-InContact-MasterId"].toString();
                }
                if (headers["X-InContact-ContactId"]) {
                    contextData.spawnedContactId = headers["X-InContact-ContactId"].toString();
                }

                // Add to context for voice
                api.log("info", `setNiCEviewContext: Setting context data for channel ${channel}: ${JSON.stringify(contextData)}`);
                api.addToContext("data", contextData, "simple");
            } else if (input.data && typeof input.data === "object") {
                // Add to context for chat
                if (input.data.ivaParams) {
                    try {
                        input.data.ivaParams = JSON.parse(input.data.ivaParams);
                    } catch {
                        input.data.ivaParams = "";
                    }
                }
                api.log("info", `setNiCEviewContext: Setting context data for channel ${channel}: ${JSON.stringify(input.data)}`);
                api.addToContext("data", input.data, "simple");
            } else {
                api.log("info", `setNiCEviewContext: No valid data found in input for channel ${channel}`);
                api.addToContext("SetNiCEviewContext", `No valid data found in input for channel ${channel}`, 'simple');
            }
        } catch (error) {
            api.log("error", `setNiCEviewContext: Error setting context: ${error.message}`);
            api.addToContext("SetNiCEviewContext", `Error setting context: ${error.message}`, 'simple');
        }
    }
});