import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
import { getAccessToken } from "../helpers/getAccessToken";

export interface IGetSharepointListItemsParams extends INodeFunctionBaseParams {
	config: {
		authentication: "cloud";
		cloudAuth: {
			tenantId: string;
			clientId: string;
			clientSecret: string;
		};
		url: string;
		list: string;
		filter: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const getSharepointListItemsNode = createNodeDescriptor({
	type: "getSharepointListItems",
	defaultLabel: "Get Sharepoint List Items",
	fields: [
		{
			key: "authentication",
			label: "Select Authentication",
			type: "select",
			defaultValue: "cloud",
			params: {
				required: true,
				options: [
					{
						label: "Cloud",
						value: "cloud"
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
			type: "cognigyText",
			description: "The Sharepiont API URL",
			params: {
				required: true
			}
		},
		{
			key: "list",
			label: "List",
			description: "the Sharepoint list name",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "filter",
			label: "Filter",
			description: "Add a filter to the query",
			defaultValue: "?$select=Title",
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
		{ type: "field", key: "list" },
		{ type: "field", key: "filter" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#038387"
	},
	function: async ({ cognigy, config }: IGetSharepointListItemsParams) => {
		const { api } = cognigy;
		const { cloudAuth, authentication, url, list, filter, storeLocation, inputKey, contextKey } = config;

		if (filter.length !== 0) {
			if (!filter.includes('?')) {
			  throw new Error("You have to insert an '?' at the beginning of your filter.");
			}
		  }

		try {
			let responseData: any;

			const { tenantId, clientId, clientSecret } = cloudAuth;
			const accessToken = await getAccessToken(tenantId, clientId, clientSecret);

			const response = await axios.get(
				`${url}/_api/lists/getbytitle('${list}')/items/${filter}`,
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