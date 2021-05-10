import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ISendVerifyPinParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			apiKey: string;
			apiSecret: string;
		};
		brandName: string;
		pinExpiry: number;
		receiverNumber: number;
		codeLength: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const sendVerifyPinNode = createNodeDescriptor({
	type: "sendVerifyPin",
	defaultLabel: "Send Verify Pin",
	summary: "Sends a verify pin message",
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
			key: "brandName",
			label: "Brand Name",
			description: "The name of the brand that sends the verification pin",
			type: "cognigyText",
			defaultValue: "Cognigy",
			params: {
				required: true
			}
		},
		{
			key: "receiverNumber",
			label: "Receiver Number",
			description: "The receiver telephone number, starting with the country code such as 49 or 43",
			type: "cognigyText",
			defaultValue: "49123456789",
			params: {
				required: true
			}
		},
		{
			key: "pinExpiry",
			label: "Pin Expiry",
			description: "The time after which the code expires while it must be an integer between 60 and 3600 seconds",
			type: "number",
			defaultValue: 300
		},
		{
			key: "codeLength",
			label: "Code Length",
			description: "How many numbers the code should contain",
			type: "select",
			defaultValue: "4",
			params: {
				options: [
					{
						label: "4",
						value: "4"
					},
					{
						label: "6",
						value: "6"
					}
				]
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
			defaultValue: "vonage.pin",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "vonage.pin",
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
		},
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"pinExpiry",
				"codeLength"
			]
		},
	],
	tokens: [
		{
			label: "Verify Request Id",
			type: "input",
			script: "input.vonage.pin.request_id"
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "brandName" },
		{ type: "field", key: "receiverNumber" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#fff"
	},
	function: async ({ cognigy, config }: ISendVerifyPinParams) => {
		const { api } = cognigy;
		const { connection, pinExpiry, codeLength, brandName, receiverNumber, storeLocation, inputKey, contextKey } = config;
		const { apiKey, apiSecret } = connection;

		try {
			const response = await axios({
				method: "get",
				url: `https://api.nexmo.com/verify/json?&api_key=${apiKey}&api_secret=${apiSecret}&number=${receiverNumber}&brand=${brandName}&pin_expiry=${pinExpiry}&code_length=${codeLength}`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/x-www-form-urlencoded"
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
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});