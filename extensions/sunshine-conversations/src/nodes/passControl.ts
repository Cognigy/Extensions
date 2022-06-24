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
		useMetadata: boolean;
		metadata: any;
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
			key: "useMetadata",
			type: "toggle",
			label: "Use Metadata",
			defaultValue: false,
			description: "Whether to send metadata information or not"
		},
		{
			key: "metadata",
			type: "json",
			label: "Metadata",
			description: "Any metadata that should be sent to the handover agent",
			defaultValue: `{
	"dataCapture.ticketField.54321": "Blue",
    "dataCapture.ticketField.98112": "981235",
    "dataCapture.systemField.requester.name": "Frodo",
    "dataCapture.systemField.requester.email": "sneaky.hobbit@ringbearers.org",
    "first_message_id": "603012d7e0a3f9000c879b67"
}`,
			condition: {
				key: "useMetadata",
				value: true
			}
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
			key: "metadataOption",
			label: "Metadata",
			defaultCollapsed: true,
			fields: [
				"useMetadata",
				"metadata"
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
		{ type: "section", key: "metadataOption" },
		{ type: "section", key: "sunCon" },
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#eec83c"
	},
	function: async ({ cognigy, config }: IPassControlParams) => {
		const { api } = cognigy;
		const { connection, conversationId, switchboardIntegration, useMetadata, metadata, storeLocation, contextKey, inputKey } = config;
		const { keyId, secret, appId } = connection;

		let data: any;

		if (useMetadata) {
			data = {
				"switchboardIntegration": switchboardIntegration,
				metadata
			};
		} else {
			data = {
				"switchboardIntegration": switchboardIntegration
			};
		}

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
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}

	}
});