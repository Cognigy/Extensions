import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface ISendMessageToLiveAgentParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			webhookUrl: string;
		};
		text: string,
		useImage: boolean;
		imageUrl: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const sendMessageToLiveAgentNode = createNodeDescriptor({
	type: "sendMessageToLiveAgent",
	defaultLabel: "Send Message",
	fields: [
		{
			key: "connection",
			label: "Slack Connection",
			type: "connection",
			params: {
				connectionType: "slack",
				required: true
			}
		},
		{
			key: "text",
			type: "cognigyText",
			label: "Text Message",
			defaultValue: "{{input.text}}",
			description: "You can use Markdown for formatting the text message.",
			params: {
				placeholder: "Insert your message here...",
				multiline: true,
				required: true
			},
		},
		{
			key: "useImage",
			type: "toggle",
			label: "Add Image to Message",
			defaultValue: false,
			description: "Whether to add an image to the Slack message or not.",
			params: {
				required: false
			},
		},
		{
			key: "imageUrl",
			type: "cognigyText",
			label: "Image URL",
			defaultValue: "",
			description: "The public url of the image.",
			params: {
				required: false
			},
			condition: {
				key: "useImage",
				value: true,
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			defaultValue: "input",
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
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "slack",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "slack",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},
	],
	sections: [
		{
			key: "storage",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey",
			]
		},
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"useImage",
				"imageUrl"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "text" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#E01E5A"
	},
	function: async ({ cognigy, config }: ISendMessageToLiveAgentParams) => {
		const { api, input } = cognigy;
		const { text, useImage, imageUrl, connection, storeLocation, contextKey, inputKey } = config;
		const { webhookUrl } = connection;

		// Decide which type of message should be sent
		let data: any;
		if (useImage) {
			data = {
				"blocks": [
					{
						"type": "section",
						"block_id": "section567",
						"text": {
							"type": "mrkdwn",
							text
						},
						"accessory": {
							"type": "image",
							"image_url": imageUrl,
							"alt_text": "cognigy"
						}
					}
				]
			};
		} else {
			data = {
				"blocks": [
					{
						"type": "section",
						"text": {
							"type": "mrkdwn",
							text
						}
					}
				]
			};
		}

		try {

			const response = await axios({
				method: "POST",
				url: webhookUrl,
				headers: {
					"Content-Type": "application/json"
				},
				data
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}

		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});