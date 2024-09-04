import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface ICreateConversationParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			url: string;
			orgId: string;
			esDeveloperName: string;
		};
		handoverAcceptedMessage: string;
		routingAttributes: any;
		sendTranscript: boolean;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

interface ICognigyTranscriptTurn {
	source: string | "bot" | "user";
	text: string;
}


const generateUUID = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
};

export const createConversationNode = createNodeDescriptor({
	type: "createConversation",
	defaultLabel: "Handover to Agent",
	fields: [
		{
			key: "connection",
			label: "Salesforce Messaging Credentials",
			type: "connection",
			params: {
				connectionType: "messaging",
				required: true
			}
		},
		{
			key: "handoverAcceptedMessage",
			label: "Handover Accepted Message",
			type: "cognigyText",
			description: "The message to display to the user once the handover request was accepted by the live chat provider",
			defaultValue: "",
			params: {
				required: false
			}
		},
		{
			key: "routingAttributes",
			label: "Routing Attributes",
			type: "json",
			description: "Information about the conversation captured from the pre-chat form that the end user completes",
			defaultValue: "{}",
			params: {
				required: false
			}
		},
		{
			key: "sendTranscript",
			label: "Send Transcript",
			type: "toggle",
			defaultValue: false,
			params: {
				required: false
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			defaultValue: "context",
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
			defaultValue: "messaging",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "messaging",
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
			key: "prechat",
			label: "Prechat",
			defaultCollapsed: true,
			fields: [
				"routingAttributes",
				"sendTranscript"
			]
		},
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "handoverAcceptedMessage" },
		{ type: "section", key: "prechat" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#009EDB"
	},
	function: async ({ cognigy, config }: ICreateConversationParams) => {
		const { api, input, context } = cognigy;
		const { handoverAcceptedMessage, routingAttributes, sendTranscript, connection, storeLocation, contextKey, inputKey } = config;
		const { url, orgId, esDeveloperName } = connection;

		// Send handover accepted message
		api.say(handoverAcceptedMessage);

		api.log("info", `[Salesforce MIAW] Get Access Token for session with id ${input.sessionId}`);
		try {
			const authResponse = await axios({
				method: "POST",
				url: `${url}/iamessage/api/v2/authorization/unauthenticated/access-token`,
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json"
				},
				data: {
					orgId,
					esDeveloperName,
					capabilitiesVersion: "1",
					platform: "Web"
				}
			});

			const accessToken = authResponse?.data?.accessToken;

			api.log("info", `[Salesforce MIAW] Create conversation for session with id ${input.sessionId}`);

			try {
				const createConversationResponse = await axios({
					method: "POST",
					url: `${url}/iamessage/api/v2/conversation`,
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json",
						"Authorization": `Bearer ${accessToken}`
					},
					data: {
						conversationId: input.sessionId.replace('session-', ''),
						esDeveloperName,
						routingAttributes
					}
				});

				api.log("info", `[Salesforce MIAW] Send last user message to conversation for session with id ${input.sessionId}`);

				if (sendTranscript) {
					if (context.transcript) {
						for (const message of context.transcript as ICognigyTranscriptTurn[]) {
							// Send user message to agent
							await axios({
								method: "POST",
								url: `${url}/iamessage/api/v2/conversation/${input.sessionId.replace('session-', '')}/message`,
								headers: {
									"Content-Type": "application/json",
									"Authorization": `Bearer ${accessToken}`
								},
								data: {
									message: {
										"id": generateUUID(),
										"messageType": "StaticContentMessage",
										"staticContent": {
											"formatType": "Text",
											"text": message?.source === 'bot' ? `Virtual Agent: ${message.text}` : message.text
								}
									},
									esDeveloperName
								}
							});
						}
					}

				} else {
					// Send user message to agent
					await axios({
						method: "POST",
						url: `${url}/iamessage/api/v2/conversation/${input.sessionId.replace('session-', '')}/message`,
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${accessToken}`
						},
						data: {
							message: {
								"id": generateUUID(),
								"messageType": "StaticContentMessage",
								"staticContent": {
									"formatType": "Text",
									"text": input.text
								}
							},
							esDeveloperName
						}
					});
				}

				api.log("info", `[Salesforce MIAW] Prepare Endpoint Transformer for session with id ${input.sessionId}`);

				// Configure Endpoint Transformer
				api.say("", {
					handover: true,
					accessToken
				});

				if (storeLocation === "context") {
					api.addToContext(contextKey, createConversationResponse.data, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, createConversationResponse.data);
				}

			} catch (error) {
				if (storeLocation === "context") {
					api.addToContext(contextKey, error.message, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, error.message);
				}
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