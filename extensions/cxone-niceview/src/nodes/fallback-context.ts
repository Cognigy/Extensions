import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { getNiCEviewData } from "../helpers/services";

export interface IgetSendSignalParams extends INodeFunctionBaseParams {
    config: {
        userToken: string;
        settingName: string;
    };
}

export const setNiCEviewContextFallback = createNodeDescriptor({
    type: "setNiCEviewContextFallback",
    defaultLabel: "NiCEview Fallback",
    summary: "Retrieve and set NiCEview demo context data when it's missing, for Cognigy flow testing without the dispatcher.",
    preview: {
        key: "settingName",
        type: "text"
    },
    fields: [
        {
            key: "userToken",
            label: "User Token",
            type: "text",
            description: "NiCEview User Token for the demo.",
            params: {
                required: true
            }
        },
        {
            key: "settingName",
            label: "Demo Name",
            type: "text",
            description: "NiCEview Demo Name for the demo.",
            params: {
                required: true
            }
        }
    ],
    sections: [],
    form: [
        { type: "field", key: "userToken" },
        { type: "field", key: "settingName" }
    ],
    appearance: {
        color: "#A060F1"
    },
    function: async ({ cognigy, config }: IgetSendSignalParams) => {
        const { api, input, context } = cognigy;
        const { userToken, settingName} = config;
        if (context.data && context.data.flowId) {
             api.log("info", `setNiCEviewContextFallback: context data exists. Exiting...`);
             return;
        }
        api.log("info", `setNiCEviewContextFallback: context data doesn't exist. Retreiving...`);

        try {
            const niceViewData = await getNiCEviewData(api, userToken, settingName);
            let ivaParams = {};
            try {
                ivaParams = JSON.parse(niceViewData.customIvaJson);
            } catch (err) {
                api.log("warn", `setNiCEviewContextFallback: Failed to parse customIvaJson: ${err.message}`);
                ivaParams = {};
            }
            const nvData = {
                "agentId": niceViewData.agentId || "",
                "ani": '',
                "contactId": '100000000000',
                "copilot": niceViewData.copilotId || "",
                "customerName": niceViewData.companyName || "",
                "digitalSkillId": niceViewData.skillId || "",
                "flowChannel": "TESTCHAT",
                "flowId": niceViewData.flowId || "",
                "invocationId": "100000000000",
                "ivaParams": ivaParams,
                "ocpSessionId": "4597359:100000000000",
                "spawnedContactId": "100000000000",
                "voiceSkillId": niceViewData.voiceSkillId || ""
            };
            api.log("info", `setNiCEviewContextFallback: Setting context data: ${JSON.stringify(nvData)}`);
            api.addToContext("data", nvData, "simple");
        } catch (error) {
            api.log("error", `setNiCEviewContextFallback: Error setting context data: ${error.message}`);
            api.addToContext("SetNiCEviewContextFallback", `Error setting context data: ${error.message}`, 'simple');
        }
    }
});