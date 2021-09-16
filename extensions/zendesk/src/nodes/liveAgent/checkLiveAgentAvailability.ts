import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetAccountStatusParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			clientId: string;
			clientSecret: string;
			username: string;
			password: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const checkLiveAgentAvailabilityNode = createNodeDescriptor({
	type: "checkLiveAgentAvailability",
	defaultLabel: "Check Live Agent Availability",
	summary: "Checks if an agent is available in Zendesk",
	fields: [
		{
			key: "connection",
			label: "Zendesk OAuth2 Connection",
			type: "connection",
			params: {
				connectionType: "zendesk-oauth",
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
			},
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "zendesk.liveAgentAvailability",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "zendesk.liveAgentAvailability",
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
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00363d"
	},
	function: async ({ cognigy, config }: IGetAccountStatusParams) => {
		const { api } = cognigy;
		const { connection, storeLocation, contextKey, inputKey } = config;
		const { clientId, clientSecret, username, password } = connection;

		try {

			// const tokenPayload = `client_id=${clientId}`
			// + `&grant_type=authorization_code`
			// + `&scope=${scope}`
			// + `&code=${authCode}`
			// + `&redirect_uri=${encodeURIComponent(redirectUri)}`
			// + `&client_secret=${clientSecret}`;

			const tokenPayload = `client_id=${clientId}`
			+ `&grant_type=client_credentials`
			+ `&client_secret=${clientSecret}`;

			const authResponse = await axios({
				method: "post",
				url: "https://www.zopim.com/oauth2/token",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				data: tokenPayload,
			});

			const response = await axios({
				method: "get",
				url: `https://www.zopim.com/stream/agents`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authResponse.data.access_token}`
				},
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
			}
		} catch (error) {

			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error });
			}
		}
	}
});