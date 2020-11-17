import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const spauth = require('node-sp-auth');
const request = require('request-promise');

export interface IGetSharepointListItemsParams extends INodeFunctionBaseParams {
	config: {
		connection: {
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
		{ type: "field", key: "connection" },
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
		const { connection, url, list, filter, storeLocation, inputKey, contextKey } = config;
		const { clientId, clientSecret } = connection;

		if (filter.length !== 0) {
			if (!filter.includes('?')) {
			  throw new Error("You have to insert an '?' at the beginning of your filter.");
			}
		  }

		try {
			const data = await spauth.getAuth(url, {
				clientId,
				clientSecret
			});

			let headers = data.headers;
			headers['Accept'] = 'application/json;odata=verbose';

			const response = await request.get({
				url: `${url}/_api/lists/getbytitle('${list}')/items/${filter}`,
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