import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as elasticsearch from 'elasticsearch';


export interface ISearchWithDSLParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			host: string;
		};
		index: string;
		type: string;
		body: JSON;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const searchWithDSLNode = createNodeDescriptor({
	type: "searchWithDSL",
	defaultLabel: "Search With DSL",
	preview: {
		key: "index",
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
			key: "index",
			label: "Search Index",
			type: "cognigyText",
			params: {
				required: true,
			},
		},
		{
			key: "type",
			label: "Search Index Type",
			type: "cognigyText",
			params: {
				required: true,
			},
		},
		{
			key: "body",
			label: "DSL Querying Structure",
			type: "json",
			defaultValue: `
			{
				"query": {
				  "match": {
					"body": "elasticsearch"
				  }
				}
			  }
			`,
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
			defaultValue: "searchResultDSL",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "searchResultDSL",
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
			key: "connectionSection",
			label: "Connection",
			defaultCollapsed: false,
			fields: [
				"connection",
			]
		}
	],
	form: [
		{ type: "section", key: "connectionSection" },
		{ type: "field", key: "index" },
		{ type: "field", key: "type" },
		{ type: "field", key: "body" },
		{ type: "section", key: "storage" },

	],
	appearance: {
		color: "#f3d337"
	},
	function: async ({ cognigy, config }: ISearchWithDSLParams) => {
		const { api } = cognigy;
		const { index, type, body, connection, storeLocation, contextKey, inputKey } = config;
		const { host } = connection;

		if (!index) throw new Error("No elastic search index defined");
		if (!type) throw new Error("No elastic search index type defined");
		if (!body) throw new Error("No DSL query body defined");

		const client = await new elasticsearch.Client({
			host,
			log: 'trace'
		});

		try {
			// prevent 404
			await client.indices.delete({
				index,
				ignore: [404]
			  });

			const response = await client.search({
				index,
				type,
				body
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