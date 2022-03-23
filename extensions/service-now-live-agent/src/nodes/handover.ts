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
		cognigySessionID: string;
		cognigyUserID: string;
		cognigyInputID: string;
		quitPhrase: string;
		userId: string;
		emailId: string;
		timezone: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
		talkToBOT: boolean;
		botQuitPhrase: string;
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
			key: "quitPhrase",
			label: "Phrase to quit Live Chat",
			defaultValue: "stop",
			type: "cognigyText",
			description: "Please enter the phrase to quit the livechat session.",
			params: {
				required: true
			}
		},
		{
			key: "userId",
			label: "User Identifier",
			type: "cognigyText",
			defaultValue: "Cognigy User",
			description: "Please enter the user id."
		},
		{
			key: "emailId",
			label: "User email address",
			type: "cognigyText",
			defaultValue: "user@cognigy.com",
			description: "Please enter the user email address"
		},
		{
			key: "timezone",
			label: "User's locale",
			type: "cognigyText",
			defaultValue: "Europe/Germany",
			description: "Please enter the user's locale",
		},
		{
			key: "talkToBOT",
			type: "toggle",
			label: "Talk to ServiceNow BOT Initially",
			defaultValue: false

		},
		{
			key: "botQuitPhrase",
			label: "BOT closed phrase",
			type: "cognigyText",
			description: "Overcome bug in ServiceNow - phase emited by BOT when conversation closed..",
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
			key: "cancelOptions",
			label: "Cancel Handover Options",
			defaultCollapsed: true,
			fields: [
				"quitPhrase"
			]
		},
		{
			key: "virtualAgentOptions",
			label: "Virtual Agent Options",
			defaultCollapsed: true,
			fields: [
				"talkToBOT",
				"botQuitPhrase"
			]
		},
		{
			key: "userOptions",
			label: "User Options",
			defaultCollapsed: false,
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
		{ type: "section", key: "cancelOptions" },
		{ type: "section", key: "virtualAgentOptions" },
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
		const { connection, handoverAcceptMessage, quitPhrase, userId, emailId, timezone, storeLocation, inputKey, contextKey, talkToBOT, botQuitPhrase } = config;

		let hashedAuthHeader = null;
		if (connection.serviceNowUserName != null)
			hashedAuthHeader = "Basic " + Buffer.from(connection.serviceNowUserName + ":" + connection.serviceNowPassword).toString('base64');
		else hashedAuthHeader = "Unset";

		let cognigyState = "STARTAGENT";
		if (talkToBOT) cognigyState = "STARTBOT";

		try {

			api.say(handoverAcceptMessage);

			const data = {
				"token": connection.serviceNowAPIToken,
				"requestId": input.inputId + "/S",
				"action": "START_CONVERSATION",
				"enterpriseId": "Cognigy",
				"clientSessionId": input.sessionId,
				"botToBot": true,
				"clientVariables": {
					"cognigyUserID": input.userId,
					cognigyState,
					userId,
					emailId,
					timezone,
					"cognigyInputID": input.userId + "/S",
					"serviceNowInstanceURL": connection.serviceNowInstanceURL,
					"serviceNowAPIToken": connection.serviceNowAPIToken,
					"quitPhrase": quitPhrase,
					"authorization": hashedAuthHeader,
					"botQuitPhrase": botQuitPhrase
				},
				"message": {
					"text": "",
					"typed": true,
					"clientMessageId": input.inputId,
				},
				userId,
				emailId,
				timezone
			};

			let response = await axios({
				method: 'POST',
				url: connection.serviceNowInstanceURL + '/api/sn_va_as_service/bot/integration',
				data: data,
				headers: {
					'Authorization': hashedAuthHeader,
					'Content-Type': 'application/json',
					'Accept': 'application/json',
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
