import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IGetAgentMessageParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			liveAgentUrl: string;
			organizationId: string;
			deploymentId: string;
			livechatButtonId: string;
		};
		messageServerUrl: string;
		liveAgentAffinity: string;
		liveAgentSessionKey: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getAgentMessageNode = createNodeDescriptor({
	type: "getAgentMessage",
	defaultLabel: "(BETA) Get Agent Messages - Service Cloud",
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
			key: "messageServerUrl",
			type: "cognigyText",
			label: "Message Server URL",
			defaultValue: "https://your-server.com",
			params: {
				required: true
			},
		},
		{
			key: "liveAgentAffinity",
			type: "cognigyText",
			label: "Live Agent Affinity",
			defaultValue: "{{context.liveChat.session.affinityToken}}",
			params: {
				required: true
			},
		},
		{
			key: "liveAgentSessionKey",
			type: "cognigyText",
			label: "Live Agent Session Key",
			defaultValue: "{{context.liveChat.session.key}}",
			params: {
				required: true
			},
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
		}
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
			defaultCollapsed: false,
			fields: [
				"liveAgentAffinity",
				"liveAgentSessionKey"
			]
		},
		{
			key: "connectionSection",
			label: "Connection",
			defaultCollapsed: false,
			fields: [
				"connection",
			]
		}
	],
	form: [
		{ type: "section", key: "connectionSection" },
		{ type: "field", key: "messageServerUrl" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#009EDB"
	},
	function: async ({ cognigy, config }: IGetAgentMessageParams) => {
		const { api, input } = cognigy;
		const { messageServerUrl, liveAgentAffinity, liveAgentSessionKey, connection, storeLocation, contextKey, inputKey } = config;

		if (!liveAgentAffinity) throw new Error("The live agent affinity is missing.");
		if (!liveAgentSessionKey) throw new Error("The live agent session key is missing.");

		const { liveAgentUrl, organizationId, deploymentId, livechatButtonId } = connection;
		if (!liveAgentUrl) throw new Error("The secret is missing the 'liveAgentUrl' key");
		if (!organizationId) throw new Error("The secret is missing the 'organizationId' key");
		if (!deploymentId) throw new Error("The secret is missing the 'deploymentId' key");
		if (!livechatButtonId) throw new Error("The secret is missing the 'livechatButtonId' key");

		try {
			const response = await axios({
				method: 'get',
				url: `${messageServerUrl}/get-agent-messages?userId=${input.userId}&sessionId=${input.sessionId}&URLToken=${input.URLToken}&liveAgentUrl=${liveAgentUrl}&liveAgentAffinity=${liveAgentAffinity}&liveAgentSessionKey=${liveAgentSessionKey}`
			});
		} catch (error) {
			throw new Error()
		}
	}
});