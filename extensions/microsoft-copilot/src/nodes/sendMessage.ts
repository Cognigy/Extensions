import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ISendMessageProps extends INodeFunctionBaseParams {
	config: {
		connection: {
			directLineTokenEndpoint: string;
		},
		text: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const sendMessageNode = createNodeDescriptor({
	type: "sendMessage",
	defaultLabel: "Send Message",
	preview: {
		key: "text",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: {
				default: "Copilot Connection"
			},
			type: "connection",
			params: {
				connectionType: "microsoft-copilot",
				required: true
			}
		},
		{
			key: "text",
			label: "Text",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			params: {
				options: [
					{
						label: "Input",
						value: "input"
					},
					{
						label: "Context",
						value: "context"
					}
				],
				required: true
			},
			defaultValue: "input"
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "copilot",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "copilot",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storageOption",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "text" },
		{ type: "section", key: "storageOption" }
	],

	function: async ({ cognigy, config }: ISendMessageProps) => {
		const { api, input } = cognigy;
		const { connection, text, storeLocation, inputKey, contextKey } = config;
		const { directLineTokenEndpoint } = connection;

		// Docs: https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-receive-activities?view=azure-bot-service-4.0

		try {

			// Get the Direct Line Token for the converstaion
			const directLineTokenResponse = await axios.get(directLineTokenEndpoint, { headers: { "Accept": "application/json" } });
			const { token, conversationId } = directLineTokenResponse?.data;

			// Start the conversation
			const startConversationResponse = await axios.post("https://directline.botframework.com/v3/directline/conversations", {}, { headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` } });
			const { streamUrl } = startConversationResponse?.data;

			// Send new activity to copilot
			const sendActivityResponse = await axios.post(`https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`, {
				"locale": "en-EN",
				"type": "message",
				"from": {
					"id": input.userId
				},
				"text": text
			}, {
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				}
			});
			const { id } = sendActivityResponse?.data;

			// Retrieve list of activities
			const retrieveActivitiesResponse = await axios.get(`https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`, { headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` } });
			const { activities } = retrieveActivitiesResponse?.data;

			if (storeLocation === "context") {
				api.addToContext(contextKey, { conversationId, streamUrl, activities, token }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { conversationId, streamUrl, activities, token });
			}

		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}
	}
});