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
		cognigySessionID: string;
		cognigyUserID: string;
		cognigyInputID: string;
		quitPhrase: string;
		userID: string;
		emailID: string;
		locale: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
		talkToBOT: boolean;
		botQuitPhrase: string;
	};
}

export const handoverNode = createNodeDescriptor({
	type: "handover",
	summary: "Start a conversation in Service Now Live Agent",
	defaultLabel: "Handover",
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
			key: "quitPhrase",
			label: "Phrase to quit livechat",
			type: "cognigyText",
			description: "Please enter the phrase to quit the livechat session.",
			params: {
				required: true
			}
		},
		{
			key: "userID",
			label: "User Identifier",
			type: "cognigyText",
			description: "Please enter the user id.",
			params: {
				required: true
			}
		},
		{
			key: "emailID",
			label: "User email address",
			type: "cognigyText",
			description: "Please enter the user email address",
			params: {
				required: true
			}
		},
		{
			key: "locale",
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
			key: "advanced",
			label: "Advanced Options",
			defaultCollapsed: true,
			fields: [
				"talkToBOT",
				"botQuitPhrase"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "quitPhrase" },
		{ type: "field", key: "userID" },
		{ type: "field", key: "emailID" },
		{ type: "field", key: "locale" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IServiceNowNodeParams) => {
		const { api, input } = cognigy;
		const { connection, quitPhrase, userID, emailID, locale, storeLocation, inputKey, contextKey, talkToBOT, botQuitPhrase } = config;

		let hashedAuthHeader = null;
		if (connection.serviceNowUserName != null)
			hashedAuthHeader = "Basic " + Buffer.from(connection.serviceNowUserName + ":" + connection.serviceNowPassword).toString('base64');
		else hashedAuthHeader = "Unset";

		let cognigyState = "STARTAGENT";
		if (talkToBOT) cognigyState = "STARTBOT";

		try {

			const data = {
				"token": connection.serviceNowAPIToken,
				"requestId": input.inputId + "/S",
				"action": "START_CONVERSATION",
				"enterpriseId": "Cognigy",
				"clientSessionId": input.sessionId,
				"botToBot": true,
				"clientVariables": {
					"cognigyUserID": input.userId,
					"cognigyState": cognigyState,
					"userId": userID,
					"emailId": emailID,
					"timezone": locale,
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
				"userId": userID,
				"emailId": emailID,
				"timezone": locale
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

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, "Unable to start ServiceNow agent conversation .../n" + error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, "Unable to start ServiceNow agent conversation .../n" + error.message);
			}
		}
	}
});
