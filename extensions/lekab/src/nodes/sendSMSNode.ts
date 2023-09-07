import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
const qs = require('qs');

export interface ISendSMSParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			APIkey: string;
		};
		from: string;
		to: string;
		body: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const sendSMSNode = createNodeDescriptor({
	type: "sendSMS",
	defaultLabel: "Send SMS",

	fields: [
		{
			key: "connection",
			label: "Lekab Connection",
			type: "connection",
			params: {
				connectionType: "lekab",
				required: true
			}
		},
		{
			key: "from",
			label: "Sender Number",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "to",
			label: "Receiver Number",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "body",
			label: "Message Body",
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
			defaultValue: "lekab",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "lekab",
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
		{ type: "field", key: "from" },
		{ type: "field", key: "to" },
		{ type: "field", key: "body" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#FF6C22"
	},
	function: async ({ cognigy, config }: ISendSMSParams) => {
		const { api } = cognigy;
		const { connection, from, to, body, storeLocation, inputKey, contextKey } = config;
		const { APIkey } = connection;

		if (!body) throw new Error("SMS body missing or empty.");
		if (!from) throw new Error("The sender is missing. Define the 'from' field.");
		if (!to) throw new Error("The receiver is missing. Define the 'to' field.");

		try {

			const smsData = {
				"apikey": APIkey,
				"from": from,
				"to": [to],
				"message": body
			};

			const response = await axios({
				method: 'post',
				url: 'https://secure.lekab.com/restsms/lekabrest/send',
				headers: {
					'Content-Type': 'text/plain'
				  },
				data: smsData

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