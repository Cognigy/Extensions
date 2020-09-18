import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { Client } from "@elastic/elasticsearch";
import { authenticateClient } from "../helpers/authenticateClient";


export interface ISearchParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			cloudId: string;
			username: string;
			password: string;
			node: string;
			apiKey: string;
		};
		authentication: "cloud" | "basic" | "apiKey";
		index: string;
		type: string;
		body: JSON;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const searchNode = createNodeDescriptor({
	type: "search",
	defaultLabel: "Search",
	preview: {
		key: "index",
		type: "text"
	},
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
					},
					{
						label: "API Key",
						value: "apiKey"
					}
				],
			}
		},
		{
			key: "cloudAuth",
			label: "Elastic Search Cloud",
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
			key: "basicAuth",
			label: "Elastic Search Basic Auth",
			type: "connection",
			params: {
				connectionType: "basic",
				required: true
			},
			condition: {
				key: "authentication",
				value: "basic",
			}
		},
		{
			key: "apiKeyAuth",
			label: "Elastic Search API Key",
			type: "connection",
			params: {
				connectionType: "apiKey",
				required: true
			},
			condition: {
				key: "authentication",
				value: "apiKey",
			}
		},
		{
			key: "index",
			label: "Search Index",
			description: "The Elastic Search Index",
			type: "cognigyText",
			params: {
				required: true,
			},
		},
		{
			key: "body",
			label: "Query",
			description: "The DSL Query Structure",
			type: "json",
			defaultValue: `{
	"query": {
	  "match": {
		"quote": "elasticsearch"
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
			defaultValue: "elastic.result",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "elastic.result",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},
	],
	sections: [
		{
			key: "connectionSection",
			label: "Authentication",
			defaultCollapsed: false,
			fields: [
				"authentication",
				"cloudAuth",
				"basicAuth",
				"apiKeyAuth"
			]
		},
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
		{ type: "section", key: "connectionSection" },
		{ type: "field", key: "index" },
		{ type: "field", key: "body" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#f3d337"
	},
	function: async ({ cognigy, config }: ISearchParams) => {
		const { api } = cognigy;
		const { authentication, index, type, body, connection, storeLocation, contextKey, inputKey } = config;

		// Create Elastic Client
		const client: Client = authenticateClient(connection, authentication);

		try {
			const response = await client.search({
				index,
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
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}
	}
});