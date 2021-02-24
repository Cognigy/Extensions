import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
const rp = require('request-promise');

export interface IGetAuthenticationTokenParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			clientId: string;
			clientSecret: string;
		};
		redirectUri: string;
		scope: string;
		authCode: string;
		tenant: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getAuthenticationTokenNode = createNodeDescriptor({
	type: "getAuthenticationToken",
	defaultLabel: "Get Authentication Token",
	fields: [
		{
			key: "connection",
			label: "Azure Connection",
			type: "connection",
			params: {
				connectionType: "login",
				required: true
			}
		},
		{
			key: "redirectUri",
			label: "Redirect URL",
			description: "The url which should be triggered after user is logged in with microsoft.",
			type: "cognigyText",
			defaultValue: "https://localhost:8080/auth-callback.html",
			params: {
				required: true,
			},
		},
		{
			key: "scope",
			label: "Scope",
			description: "For example user.read",
			type: "cognigyText",
			defaultValue: "user.read calendars.readWrite",
			params: {
				required: true,
			},
		},
		{
			key: "authCode",
			label: "Microsoft Authentication Code",
			description: "The microsoft auth code, your call back url stored",
			defaultValue: "{{input.data.microsoftAuth.code}}",
			type: "cognigyText",
			params: {
				required: true,
			},
		},
		{
			key: "tenant",
			label: "Tenant (ID)",
			defaultValue: "common",
			type: "cognigyText"
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
			defaultValue: "microsoft.auth",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "microsoft.auth",
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
			key: "tenantSection",
			label: "Tenant",
			defaultCollapsed: true,
			fields: [
				"tenant",
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "redirectUri" },
		{ type: "field", key: "scope" },
		{ type: "field", key: "authCode" },
		{ type: "section", key: "tenantSection" },
		{ type: "section", key: "storage" }
	],
	function: async ({ cognigy, config }: IGetAuthenticationTokenParams) => {
		const { api } = cognigy;
		const { redirectUri, scope, authCode, tenant, connection, storeLocation, inputKey, contextKey } = config;
		const { clientId, clientSecret } = connection;

		const tokenPayload = `client_id=${clientId}`
			+ `&grant_type=authorization_code`
			+ `&scope=${scope}`
			+ `&code=${authCode}`
			+ `&redirect_uri=${encodeURIComponent(redirectUri)}`
			+ `&client_secret=${clientSecret}`;

		try {
			const response = await axios.post(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, tokenPayload, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
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
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}
	}
});