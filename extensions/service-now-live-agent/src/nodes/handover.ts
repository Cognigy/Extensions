import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

declare const Buffer;

export interface IServiceNowNodeParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			serviceNowInstanceURL: string;
			serviceNowAPIToken: string;
			serviceNowUserName: string;
			serviceNowPassword: string;
		};
		handoverAcceptMessage: string;
		userId: string;
		emailId: string;
		timezone: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const handoverNode = createNodeDescriptor({
	type: "handover",
	summary: "Start a conversation with a Live Agent in the Service Now Agent Workspace",
	defaultLabel: "Handover to Agent",
	fields: [
		{
			key: "connection",
			label: "SeviceNow",
			type: "connection",
			params: {
				connectionType: "serviceNowConnection",
				required: true
			}
		},
		{
			key: "handoverAcceptMessage",
			label: "Handover Accept Message",
			type: "cognigyText",
			description: "The message to display to the user once the handover request was accepted by the live chat",
			params: {
				required: true
			}
		},
		{
			key: "userId",
			label: "User Identifier",
			type: "cognigyText",
			description: "Please enter the user id.",
			params: {
				required: true
			}
		},
		{
			key: "emailId",
			label: "User email address",
			type: "cognigyText",
			description: "Please enter the user email address",
			params: {
				required: true
			}
		},
		{
			key: "timezone",
			label: "User's locale",
			type: "cognigyText",
			description: "Please enter the user's locale",
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
			defaultValue: "snow.conversation",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "snow.conversation",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storageOption",
			label: "Storage Options",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey",
			]
		},
		{
			key: "userOptions",
			label: "User Options",
			defaultCollapsed: true,
			fields: [
				"userId",
				"emailId",
				"timezone"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "handoverAcceptMessage" },
		{ type: "section", key: "userOptions" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#80b6a1"
	},
	dependencies: {
		children: [
			"onSuccess",
			"onError"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IServiceNowNodeParams) => {
		const { api, input } = cognigy;
		const { connection, handoverAcceptMessage, userId, emailId, timezone, storeLocation, inputKey, contextKey } = config;
		const { serviceNowInstanceURL, serviceNowPassword, serviceNowUserName, serviceNowAPIToken } = connection;

		try {

			api.say(handoverAcceptMessage);

			const data = {
				token: serviceNowAPIToken,
				requestId: input.inputId + "/S",
				action: "START_CONVERSATION",
				enterpriseId: "Cognigy",
				clientSessionId: input.sessionId,
				botToBot: true,
				clientVariables: {
					cognigyUserId: input.userId,
					cognigyState: "STARTAGENT",
					userId,
					emailId,
					timezone,
					authorization: "Basic " + Buffer.from(serviceNowUserName + ":" + serviceNowPassword).toString('base64'),
					cognigyInputId: input.userId + "/S",
					serviceNowInstanceURL,
					cognigyInputI: input.userId + "/S",
					serviceNowAPIToken
				},
				message: {
					text: "",
					typed: true,
					clientMessageId: input.inputId
				},
				userId,
				emailId,
				timezone
			};

			let response = await axios({
				method: 'POST',
				url: serviceNowInstanceURL + '/api/sn_va_as_service/bot/integration',
				data: data,
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': "Basic " + Buffer.from(serviceNowUserName + ":" + serviceNowPassword).toString('base64')
				}
			});

			if (response.data?.status === "success") {
				const onSuccessChild = childConfigs.find(child => child.type === "onSuccess");
				api.setNextNode(onSuccessChild.id);
			} else {
				const onErrorChild = childConfigs.find(child => child.type === "onError");
				api.setNextNode(onErrorChild.id);
			}

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
				api.addToContext(contextKey, "Unable to start ServiceNow agent conversation: " + error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, "Unable to start ServiceNow agent conversation: " + error.message);
			}
		}
	}
});

export const onSuccess = createNodeDescriptor({
	type: "onSuccess",
	parentType: "handover",
	defaultLabel: {
		default: "On Success"
	},
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
		variant: "mini"
	}
});

export const onError = createNodeDescriptor({
	type: "onError",
	parentType: "handover",
	defaultLabel: {
		default: "On Error"
	},
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
		color: "red",
		textColor: "white",
		variant: "mini"
	}
});
