import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ISendSMSParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			apiKeySid: string;
			apiKeySecret: string;
			accountSid: string;
		};
		from: string;
		to: string;
		body: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

const MAX_SMS_LENGTH = 1600;

export const sendSMSNode = createNodeDescriptor({
	type: "sendSMS",
	defaultLabel: "Send SMS",
	summary: "Sends an SMS message via Twilio",
	fields: [
		{
			key: "connection",
			label: "Twilio Connection",
			type: "connection",
			params: {
				connectionType: "twilio",
				required: true
			}
		},
		{
			key: "from",
			label: "Sender Number",
			type: "cognigyText",
			params: {
				required: true,
				placeholder: "+4917324375843"
			}
		},
		{
			key: "to",
			label: "Receiver Number",
			type: "cognigyText",
			params: {
				required: true,
				placeholder: "+4912644334511"
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
			}
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "twilio",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "twilio",
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
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#F22F46"
	},
	dependencies: {
		children: [
			"onSuccessSendSMS",
			"onErrorSendSMS"
		]
	},
	function: async ({ cognigy, config, childConfigs }: ISendSMSParams) => {
		const { api } = cognigy;
		const { connection, from, to, body, storeLocation, inputKey, contextKey } = config;
		const { apiKeySid, apiKeySecret, accountSid } = connection;

		const storeResult = (result: unknown): void => {
			if (storeLocation === "context") {
				api.addToContext(contextKey, result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result);
			}
		};

		try {
			if (!body) {
				throw new Error("SMS body missing or empty.");
			}
			if (body.length > MAX_SMS_LENGTH) {
				throw new Error(`SMS body too long (max ${MAX_SMS_LENGTH} characters).`);
			}
			if (!from) {
				throw new Error("The sender is missing. Define the 'from' field.");
			}
			if (!to) {
				throw new Error("The receiver is missing. Define the 'to' field.");
			}

			const smsData = new URLSearchParams({
				From: from,
				To: to,
				Body: body
			}).toString();

			const response = await axios({
				method: "POST",
				url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/x-www-form-urlencoded"
				},
				auth: {
					username: apiKeySid,
					password: apiKeySecret
				},
				data: smsData
			});

			storeResult(response.data);

			const onSuccessChild = childConfigs.find(child => child.type === "onSuccessSendSMS");
			if (onSuccessChild) {
				api.setNextNode(onSuccessChild.id);
			}
		} catch (error) {
			const errorMessage = error instanceof Error
				? error.message
				: JSON.stringify(error);
			api.log("error", `sendSMS execution failed: ${errorMessage}`);

			// @ts-ignore - axios errors expose the upstream response payload
			storeResult(error?.response?.data ?? { error: errorMessage });

			const onErrorChild = childConfigs.find(child => child.type === "onErrorSendSMS");
			if (onErrorChild) {
				api.setNextNode(onErrorChild.id);
			}
		}
	}
});

export const onSuccessSendSMS = createNodeDescriptor({
	type: "onSuccessSendSMS",
	parentType: "sendSMS",
	defaultLabel: "On Success",
	constraints: {
		editable: false,
		deletable: false,
		creatable: false,
		movable: false,
		placement: {
			predecessor: {
				whitelist: []
			}
		}
	},
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini",
		showIcon: false
	}
});

export const onErrorSendSMS = createNodeDescriptor({
	type: "onErrorSendSMS",
	parentType: "sendSMS",
	defaultLabel: "On Error",
	constraints: {
		editable: false,
		deletable: false,
		creatable: false,
		movable: false,
		placement: {
			predecessor: {
				whitelist: []
			}
		}
	},
	appearance: {
		color: "#cf142b",
		textColor: "white",
		variant: "mini",
		showIcon: false
	}
});
