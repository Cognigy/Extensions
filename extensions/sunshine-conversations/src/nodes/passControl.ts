import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IPassControlParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			keyId: string;
			secret: string;
			appId: string;
		};
		conversationId: string;
		switchboardIntegration: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const passControlNode = createNodeDescriptor({
	type: "passControlNode",
	defaultLabel: "Pass Control",
	fields: [
		{
			key: "connection",
			label: "Sunshine Conversations Connection",
			type: "connection",
			params: {
				connectionType: "Sunshine Conversations",
				required: true
			}
		},
		{
			key: "conversationId",
			type: "cognigyText",
			label: "Conversation Id",
			description: "The specific ID of the current smooch conversation.",
			defaultValue: "{{ci.data.request.payload.conversation.id}}",
			params: {
				required: true
			}
		},
		{
			key: "switchboardIntegration",
			type: "text",
			label: "Switchboard Integration Name (pass to)",
			defaultValue: "next",
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "sunCon.request",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "sunCon.request",
			condition: {
				key: "storeLocation",
				value: "context",
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
		}
	],
	sections: [
		{
			key: "sunCon",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"switchboardIntegration",
				"conversationId"
			]
		},
		{
			key: "storage",
			label: "Storage Options",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey",
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "section", key: "sunCon" },
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#eec83c"
	},
	function: async ({ cognigy, config }: IPassControlParams) => {
		const { api } = cognigy;
		const { connection, conversationId, switchboardIntegration, storeLocation, contextKey, inputKey } = config;
		const { keyId, secret, appId } = connection;

		try {
			const response = await axios({
				method: 'post',
				url: `https://api.smooch.io/v2/apps/${appId}/conversations/${conversationId}/passControl`,
				auth: {
					username: keyId,
					password: secret
				},
				headers: {
					"Accept": "application/json"
				},
				data: {
					"switchboardIntegration": switchboardIntegration
				}
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
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