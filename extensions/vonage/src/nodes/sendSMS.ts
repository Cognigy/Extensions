import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ISendSMSParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			apiKey: string;
			apiSecret: string;
		};
		from: string;
		to: string;
		text: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const sendSMSNode = createNodeDescriptor({
	type: "sendSMS",
	defaultLabel: "Send SMS",
	summary: "Sends SMS messages to a given mobile number",
	fields: [
		{
			key: "connection",
			label: "Vonage Connection",
			type: "connection",
			params: {
				connectionType: "vonage",
				required: true
			}
		},
		{
			key: "from",
			label: "From",
			description: "The sender name of the SMS",
			type: "cognigyText",
			defaultValue: "Cognigy",
			params: {
				required: true
			}
		},
		{
			key: "to",
			label: "Text",
			description: "The receiver telephone number, starting with the country code such as 49 or 43",
			type: "cognigyText",
			defaultValue: "49123456789",
			params: {
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
			defaultValue: "vonage.sms",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "vonage.sms",
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
				"contextKey",
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "from" },
		{ type: "field", key: "to" },
		{ type: "field", key: "text" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#fff"
	},
	dependencies: {
		children: [
			"onSuccess",
			"onError"
		]
	},
	function: async ({ cognigy, config, childConfigs }: ISendSMSParams) => {
		const { api } = cognigy;
		const { connection, text, from, to, storeLocation, inputKey, contextKey } = config;
		const { apiKey, apiSecret } = connection;

		try {
			const response = await axios({
				method: "post",
				url: "https://rest.nexmo.com/sms/json",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				data: {
					api_key: apiKey,
					api_secret: apiSecret,
					from,
					to,
					text
				}
			});

			const onSuccessChild = childConfigs.find(child => child.type === "onSuccess");
			api.setNextNode(onSuccessChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}
		} catch (error) {

			const onErrorChild = childConfigs.find(child => child.type === "onError");
			api.setNextNode(onErrorChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});

export const onSucces = createNodeDescriptor({
	type: "onSuccess",
	parentType: "sendSMS",
	defaultLabel: "On Success",
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini"
	}
});

export const onError = createNodeDescriptor({
	type: "onError",
	parentType: "sendSMS",
	defaultLabel: "On Error",
	appearance: {
		color: "#cf142b",
		textColor: "white",
		variant: "mini"
	}
});
