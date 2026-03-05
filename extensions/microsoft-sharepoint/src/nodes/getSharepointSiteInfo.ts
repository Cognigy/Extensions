import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
import { getAccessToken } from "../helpers/getAccessToken";

export interface IGetSharepointSiteInfoParams extends INodeFunctionBaseParams {
	config: {
		authentication: "cloud" | "basic";
		cloudAuth: {
			tenantId: string;
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
			key: "authentication",
			label: "Select Authentication",
			type: "select",
			defaultValue: "basic",
			params: {
				required: true,
				options: [
					{
						label: "Cloud",
						value: "cloud"
					},
					{
						label: "Basic",
						value: "basic"
					}
				],
			}
		},
		{
			key: "cloudAuth",
			label: "Sharepoint Online",
			type: "connection",
			params: {
				connectionType: "cloud",
				required: true
			},
			condition: {
				key: "authentication",
				value: "cloud",
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
		{ type: "section", key: "connectionSection" },
		{ type: "field", key: "url" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#038387"
	},
	function: async ({ cognigy, config }: IGetSharepointSiteInfoParams) => {
		const { api } = cognigy;
		const { cloudAuth, authentication, url, storeLocation, inputKey, contextKey } = config;

		try {
			let responseData: any;

			// Get OAuth2 access token for SharePoint Online
			const { tenantId, clientId, clientSecret } = cloudAuth;
			const accessToken = await getAccessToken(tenantId, clientId, clientSecret);

			const response = await axios.get(
				`${url}/_api/web`,
				{
					headers: {
						'Authorization': `Bearer ${accessToken}`,
						'Accept': 'application/json;odata=verbose'
					}
				}
			);
			responseData = response.data;

			if (storeLocation === "context") {
				api.addToContext(contextKey, responseData, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, responseData);
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