import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as elasticsearch from 'elasticsearch';


export interface ISearchSimpleParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			host: string;
		};
		query: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const searchSimpleNode = createNodeDescriptor({
	type: "searchSimple",
	defaultLabel: "Search Simple",
	preview: {
		key: "query",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "Elastic Search Server Host",
			type: "connection",
			params: {
				connectionType: "elastic-search",
				required: true
			}
		},
		{
			key: "query",
			label: "Search Term",
			type: "cognigyText",
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
			defaultValue: "searchResult",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "searchResult",
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
		{ type: "field", key: "query" },
		{ type: "section", key: "storage" },

	],
	appearance: {
		color: "#f3d337"
	},
	function: async ({ cognigy, config }: ISearchSimpleParams) => {
		const { api } = cognigy;
		const { query, connection, storeLocation, contextKey, inputKey } = config;
		const { host } = connection;

		if (!query) throw new Error("No search query defined");

		const client = await new elasticsearch.Client({
			host,
			log: 'trace'
		});

		try {
			const body = await client.search({q: query});

			if (storeLocation === "context") {
				api.addToContext(contextKey, body, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, body);
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