import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface ISendMessageParams extends INodeFunctionBaseParams {
	config: {
		text: string;
		activityParams: any;
	};
}
export const sendMessageNode = createNodeDescriptor({
	type: "sendMessage",
	defaultLabel: "Send Message",
	fields: [
		{
			key: "text",
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
		{ type: "field", key: "text" },
		{ type: "field", key: "activityParams" }
	],
	function: async ({ cognigy, config }: ISendMessageParams) => {
		const { api } = cognigy;
		const { text, activityParams } = config;

		if (!text) throw new Error('The text is missing.');
		if (!activityParams) throw new Error('The Activity Parameters are missing.');

		api.output(text, {
			"_cognigy": {
				"_audiocodes": {
					"activities": [
						{
							"type": "message",
							text,
							activityParams
						}
					]
				}
			}
		});
	}
});