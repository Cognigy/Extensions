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


const getActivities = async (conversationId: string, token: string) => {

	const poll = async (conversationId: string, token: string): Promise<string> => {

		const response = await axios({
			method: "get",
			url: `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`,
			headers: {
				"Accept": "application/json",
				"Authorization": `Bearer ${token}`
			}
		});

		let latestActivity: any = response?.data?.activities[response?.data?.activities.length - 1];

		if (latestActivity?.type === "message" && latestActivity?.from?.role === "bot") {
			return latestActivity?.text;
		} else {

			await new Promise<void>((resolve) => setTimeout(resolve, 5000));

			// Wait three seconds until the Copilot service will be polled again
			return await poll(conversationId, token);
		}
	};

	const text: string = await poll(conversationId, token);

	return text;
};

export const run = createNodeDescriptor({
	type: "run",
	defaultLabel: "Run Copilot",
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
			defaultValue: "{{input.text}}",
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
		let { connection, text, storeLocation, inputKey, contextKey } = config;
		const { directLineTokenEndpoint } = connection;

		// Docs: https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-receive-activities?view=azure-bot-service-4.0

		try {

			// Get the Direct Line Token for the converstaion
			const directLineTokenResponse = await axios.get(directLineTokenEndpoint, { headers: { "Accept": "application/json" } });
			const { token, conversationId } = directLineTokenResponse?.data;

			// Start the conversation
			const directLineStartConversationResponse = await axios.post("https://directline.botframework.com/v3/directline/conversations", {}, { headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` } });

			// Send new activity to copilot
			await axios.post(`https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`, {
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

			// Await the answer from Microsoft Copilot
			const answer: string = await getActivities(conversationId, token);

			// Output the answer as text message
			api.say(answer);

			if (storeLocation === "context") {
				api.addToContext(contextKey, { conversationId, text }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { conversationId, text });
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