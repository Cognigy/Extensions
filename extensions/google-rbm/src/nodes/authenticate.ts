import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { google } from "googleapis";

export interface IAuthenticateParams extends INodeFunctionBaseParams {
	config: {
		serviceAccount: any;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const authenticateNode = createNodeDescriptor({
	type: "authenticate",
	defaultLabel: "Authenticate",
	fields: [
		{
			key: "serviceAccount",
			label: "Service Account",
			description: "The JSON content of the service account",
			type: "json",
			params: {
				required: true,
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
			defaultValue: "rbm",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "rbm",
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
		{ type: "field", key: "serviceAccount" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#185ABC"
	},
	function: async ({ cognigy, config }: IAuthenticateParams) => {
		const { api } = cognigy;
		const { serviceAccount, storeLocation, contextKey, inputKey } = config;

		try {
			// Set the scope that we need for the Business Messages API
			const scopes = [
				'https://www.googleapis.com/auth/businessmessages',
				'https://www.googleapis.com/auth/chat.bot'
			];

			/**
			 * Initializes the Google credentials for calling the
			 * Business Messages API.
			 */
			// configure a JWT auth client
			let authClient = new google.auth.JWT(
				serviceAccount.client_email,
				null,
				serviceAccount.private_key,
				scopes,
			);

			const response = await authClient.authorize();

			if (storeLocation === "context") {
				api.addToContext(contextKey, response, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response);
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