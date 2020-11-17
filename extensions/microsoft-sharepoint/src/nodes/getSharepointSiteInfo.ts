import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const spauth = require('node-sp-auth');
const request = require('request-promise');

export interface IGetSharepointSiteInfoParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			clientId: string;
			clientSecret: string;
		};
		url: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const getSharepointSiteInfoNode = createNodeDescriptor({
	type: "getSharepointSiteInfo",
	defaultLabel: "Get Sharepoint Site Info",
	fields: [
		{
			key: "connection",
			label: "Sharepoint Connection",
			type: "connection",
			params: {
				connectionType: "sharepoint",
				required: true
			}
		},
		{
			key: "url",
			label: "URL",
			description: "The Sharepiont API URL",
			type: "cognigyText",
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
			defaultValue: "sharepoint",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "sharepoint",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storageOption",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "url" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#038387"
	},
	function: async ({ cognigy, config }: IGetSharepointSiteInfoParams) => {
		const { api } = cognigy;
		const { connection, url, storeLocation, inputKey, contextKey } = config;
		const { clientId, clientSecret } = connection;

		try {
			const data = await spauth.getAuth(url, {
				clientId,
				clientSecret
			});

			let headers = data.headers;
			headers['Accept'] = 'application/json;odata=verbose';

			const response = await request.get({
				url: `${url}/_api/web`,
				headers: headers,
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
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});