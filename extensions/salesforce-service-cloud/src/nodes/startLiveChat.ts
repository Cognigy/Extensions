import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IStartLiveChatParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			liveAgentUrl: string;
			organizationId: string;
			deploymentId: string;
			livechatButtonId: string;
		};
		visitorName: string;
		language: string;
		prechatDetails: any;
		prechatEntities: any;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const startLiveChatNode = createNodeDescriptor({
	type: "startLiveChat",
	defaultLabel: "Start Live Chat",
	fields: [
		{
			key: "connection",
			label: "Livechat Credentials",
			type: "connection",
			params: {
				connectionType: "salesforceLiveChat",
				required: true
			}
		},
		{
			key: "language",
			type: "select",
			label: "Language",
			defaultValue: "en-US",
			params: {
				options: [
					{
						label: "English",
						value: "en-US"
					},
					{
						label: "German",
						value: "de-DE"
					}
				],
				required: true
			},
		},
		{
			key: "prechatDetails",
			label: "Prechat Details",
			type: "json",
			description: "The details that should be displayed to the Live Chat Agent.",
			defaultValue: "[]",
			params: {
				required: true
			}
		},
		{
			key: "prechatEntities",
			label: "Prechat Entites",
			type: "json",
			description: "The Salesforce entity that should be used.",
			defaultValue: "[]",
			params: {
				required: true
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
			key: "visitorName",
			type: "cognigyText",
			label: "Visitor Name",
			description: "The name of the user who is talking to the live agent.",
			defaultValue: "{{input.userId}}",
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "liveChat",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "liveChat",
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
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"visitorName",
				"prechatDetails",
				"prechatEntities"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "language" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#009EDB"
	},
	function: async ({ cognigy, config }: IStartLiveChatParams) => {
		const { api, input } = cognigy;
		const { language, visitorName, prechatDetails, prechatEntities, connection, storeLocation, contextKey, inputKey } = config;

		const { liveAgentUrl, organizationId, deploymentId, livechatButtonId } = connection;
		if (!liveAgentUrl) throw new Error("The secret is missing the 'liveAgentUrl' key");
		if (!organizationId) throw new Error("The secret is missing the 'organizationId' key");
		if (!deploymentId) throw new Error("The secret is missing the 'deploymentId' key");
		if (!livechatButtonId) throw new Error("The secret is missing the 'livechatButtonId' key");

		try {
			const sessionResponse = await axios({
				method: "GET",
				url: `${liveAgentUrl}/chat/rest/System/SessionId`,
				headers: {
					"X-LIVEAGENT-AFFINITY": 'null',
					"X-LIVEAGENT-API-VERSION": '34'
				}
			});

			try {
				const initLiveChatResponse = await axios({
					method: "POST",
					url: `${liveAgentUrl}/chat/rest/Chasitor/ChasitorInit`,
					headers: {
						"X-LIVEAGENT-SESSION-KEY": sessionResponse.data.key,
						"X-LIVEAGENT-AFFINITY": sessionResponse.data.affinityToken,
						"X-LIVEAGENT-API-VERSION": '34',
						"X-LIVEAGENT-SEQUENCE": '1'
					},
					data: {
						organizationId,
						deploymentId,
						"buttonId": livechatButtonId,
						"sessionId": sessionResponse.data.id,
						"userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36",
						language,
						visitorName,
						"screenResolution": "1900x1080",
						"prechatDetails": prechatDetails,
						"prechatEntities": prechatEntities,
						"receiveQueueUpdates": true,
						"isPost": true
					}
				});

				api.addToContext(contextKey, {
					session: sessionResponse.data,
					startedLiveChat: initLiveChatResponse.data === "OK" ? true : false
				}, 'simple');

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