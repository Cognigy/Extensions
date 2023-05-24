import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
const qs = require('qs');

export interface IBingSearchParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		}
		query: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const executeQueriesNode = createNodeDescriptor({
	type: "search",
	defaultLabel: "Search",
	summary: "Searches the web with Bing",
	fields: [
		{
			key: "connection",
			label: {
				default: "Bing Connection"
			},
			type: "connection",
			params: {
				connectionType: "bing",
				required: true
			}
		},
		{
			key: "query",
			label: "Query",
			type: "cognigyText",
			defaultValue: "{{input.text}}",
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
			defaultValue: "bing",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "bing",
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
		{ type: "field", key: "query" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: '#02AECC'
	},
	function: async ({ cognigy, config }: IBingSearchParams) => {
		const { api } = cognigy;
		const { connection, query, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		try {

			const response = await axios({
				method: 'get',
				url: `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`,
				headers: {
					'Ocp-Apim-Subscription-Key': key,
					'Accept': 'application/json'
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