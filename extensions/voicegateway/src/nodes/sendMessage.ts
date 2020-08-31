import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ISendMessageRequestParams extends INodeFunctionBaseParams {
	config: {
		text: string;
		activityParams: any;
	}
}

export const sendMessageNode = createNodeDescriptor({
	type: "sendMessage",
	defaultLabel: "Send Message",
	fields: [
		{
			key: "text",
			label: "Text",
			type: "cognigyText"
		},
		{
			key: "activityParams",
			label: "Activity Parameters",
			type: "json"
		}
	],
	preview: {
		type: "text",
		key: "text"
	},
	appearance: {
		color: "#30A4DC"
	},

	function: async ({ cognigy, config }: ISendMessageRequestParams) => {
		const { api } = cognigy;
		const { text, activityParams } = config;

		if (text) api.output(text, {
            "_cognigy": {
                "_audiocodes": {
                    "activities": [
                        {
                            "type": "message",
                            "text": text,
                            "activityParams": activityParams
                          }					  
                    ]
                }
            }
        });
	}
});