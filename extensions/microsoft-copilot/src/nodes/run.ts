import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ISendMessageProps extends INodeFunctionBaseParams {
	config: {
		connection: {
			directLineTokenEndpoint: string;
		},
		text: string;
		outputMode: string;
		inputKey: string;
		contextKey: string;
		outputResultImmediately: boolean;
		streamStopTokens: string[];
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

const streamToOutput = (text: string, stopTokens: string[], api: INodeFunctionBaseParams["cognigy"]["api"]) => {
	let currentSubstring = '';
	const result = [];

	for (const char of text) {
		if (stopTokens.includes(char)) {
			if (currentSubstring.trim() !== '') {
				result.push(currentSubstring.trim() + char);
			}
			currentSubstring = '';
		} else {
			currentSubstring += char;
		}
	}

	if (currentSubstring.trim() !== '') {
		result.push(currentSubstring.trim());
	}

	for (const substring of result) {
		api.say(substring);
	}
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
			key: "outputMode",
			type: "select",
			label: "How to handle the result",
			description: "Whether to store the result in the input, context or stream it directly into the output",
			params: {
				options: [
					{
						label: "Store in Input",
						value: "input"
					},
					{
						label: "Store in Context",
						value: "context"
					},
					{
						label: "Stream to Output",
						value: "stream"
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
				key: "outputMode",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "copilot",
			condition: {
				key: "outputMode",
				value: "context"
			}
		},
		{
			key: "outputResultImmediately",
			type: "toggle",
			label: "Output result immediately",
			defaultValue: false,
			condition: {
				or: [
					{
						key: "outputMode",
						value: "input"
					},
					{
						key: "outputMode",
						value: "context"
					}
				]
			}
		},
		{
			key: "streamStopTokens",
			type: "textArray",
			label: "Stream Output Tokens",
			description: "Tokens after which to output the stream buffer",
			defaultValue: [".", "!", "?"],
			condition: {
				key: "outputMode",
				value: "stream",
			}
		},
	],
	sections: [
		{
			key: "storageAndStreamingOptions",
			label: "Storage & Streaming Options",
			defaultCollapsed: true,
			fields: [
				"outputMode",
				"inputKey",
				"contextKey",
				"streamStopTokens",
				"outputResultImmediately"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "text" },
		{ type: "section", key: "storageAndStreamingOptions" }
	],

	function: async ({ cognigy, config }: ISendMessageProps) => {
		const { api, input } = cognigy;
		let { connection, text, outputMode, streamStopTokens, inputKey, contextKey, outputResultImmediately } = config;
		const { directLineTokenEndpoint } = connection;

		// Docs: https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-receive-activities?view=azure-bot-service-4.0

		try {

			// Get the Direct Line Token for the converstaion
			const directLineTokenResponse = await axios.get(directLineTokenEndpoint, { headers: { "Accept": "application/json" } });
			const { token, conversationId } = directLineTokenResponse?.data;

			// Start the conversation
			await axios.post("https://directline.botframework.com/v3/directline/conversations", {}, { headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` } });

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

			switch (outputMode) {
				case "input":
					// @ts-ignore
					api.addToInput(inputKey, { conversationId, text });
					break;
				case "context":
					api.addToContext(contextKey, { conversationId, text }, "simple");
					break;
				case "stream":
					// Double check that output immediately is false
					outputResultImmediately = false;
					// Stream the answer
					streamToOutput(answer, streamStopTokens, api);
					break;
			}

			// Output the answer as text message
			if (outputResultImmediately) {
				api.say(answer);
			}

		} catch (error) {
			switch (outputMode) {
				case "intput":
					// @ts-ignore
					api.addToInput(inputKey, { conversationId, text });
					break;
				case "context":
					api.addToContext(contextKey, error, "simple");
					break;
				case "stream":
					api.addToContext(contextKey, error, "simple");
					break;
			}
		}
	}
});