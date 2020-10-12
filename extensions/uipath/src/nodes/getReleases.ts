import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const request = require('request-promise-native');

export interface IGetReleasesParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			userKey: string;
			accountLogicalName: string;
			tenantName: string;
			clientId: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getReleasesNode = createNodeDescriptor({
	type: "getReleases",
	defaultLabel: "Get Releases",
	fields: [
		{
			key: "connection",
			label: "UIPath Connection",
			type: "connection",
			params: {
				connectionType: "uipath",
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
			defaultValue: "uipath.releases",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "uipath.releases",
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
		{ type: "field", key: "filter" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#f56105"
	},
	function: async ({ cognigy, config }: IGetReleasesParams) => {
		const { api } = cognigy;
		const { connection, storeLocation, contextKey, inputKey } = config;
		const { userKey, accountLogicalName, tenantName, clientId } = connection;

		try {
			const authResponse = await request({
				method: 'POST',
				uri: 'https://account.uipath.com/oauth/token',
				body: {
					grant_type: "refresh_token",
					client_id: clientId,
					refresh_token: userKey
				},
				json: true // Automatically stringifies the body to JSON
			});

			const { access_token } = authResponse;

			try {

				const response = await request({
					method: 'GET',
					url: `https://platform.uipath.com/${accountLogicalName}/${tenantName}/odata/Releases`,
					headers: {
						'Content-Type': 'application/json',
						'X-UIPATH-TenantName': tenantName
					},
					auth: {
						'bearer': access_token
					},
					json: true
				});

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