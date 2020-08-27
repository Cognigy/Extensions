import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface ISendMessageParams extends INodeFunctionBaseParams {
	config: {
		messageText: string;
		activityParams: any;
	};
}
export const sendMessageNode = createNodeDescriptor({
	type: "sendMessage",
	defaultLabel: "Send Message",
	fields: [
		{
			key: "messageText",
			label: "Text",
			type: "cognigyText",
			defaultValue: "{{input.text}}",
			params: {
				required: true
			}
		},
		{
			key: "activityParams",
			label: "Activity Parameter",
			type: "json",
			params: {
				required: true
			}
		},
	],
	form: [
		{ type: "field", key: "messageText" },
		{ type: "field", key: "activityParams" }
	],
	function: async ({ cognigy, config }: ISendMessageParams) => {
		const { api } = cognigy;
		const { messageText, activityParams } = config;

		if (!messageText) throw new Error('The text is missing.');
		if (!activityParams) throw new Error('The Activity Parameters are missing.');

		api.output("", {
			"_cognigy": {
				"_audiocodes": {
					"activities": [
						{
							"type": "message",
							messageText,
							activityParams
						}
					]
				}
			}
		});
	}
});