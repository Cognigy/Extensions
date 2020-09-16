import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import * as elasticsearch from 'elasticsearch';


export interface ISearchSimpleParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			host: string;
			auth: string;
			protocol: string;
			port: string;
		};
		selectAuth: string;
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
			key: "selectAuth",
			label: "Select Authentication",
			type: "select",
			defaultValue: "No Auth",
			params: {
				required: true,
				options: [
					{
						label: "No Auth",
						value: "No Auth"
					},
					{
						label: "Basic Auth",
						value: "Basic Auth"
					}
				],
			}
		},
		{
			key: "basicAuth",
			label: "Elastic Search Basic Auth",
			type: "connection",
			params: {
				connectionType: "elastic-search-basic-auth",
				required: true
			},
			condition: {
				key: "selectAuth",
				value: "Basic Auth",
			}
		},
		{
			key: "noAuth",
			label: "Elastic Search Server Host",
			type: "connection",
			params: {
				connectionType: "elastic-search",
				required: true
			},
			condition: {
				key: "selectAuth",
				value: "No Auth",
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
			key: "connectionSection",
			label: "Authentication",
			defaultCollapsed: false,
			fields: [
				"selectAuth",
				"noAuth",
				"basicAuth"
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
		{ type: "field", key: "query" },
		{ type: "section", key: "storage" },

	],
	appearance: {
		color: "#f3d337"
	},
	function: async ({ cognigy, config }: ISearchSimpleParams) => {
		const { api } = cognigy;
		const { selectAuth, query, connection, storeLocation, contextKey, inputKey } = config;
		const { host, auth, protocol, port } = connection;

		if (!query) throw new Error("No search query defined");

		let client: any;
		// Check selected authentication and create client
		if (selectAuth === "Basic Auth") {
			client = await new elasticsearch.Client({
				host: [
					host,
					auth,
					protocol,
					port
				],
				log: 'trace'
			});
		} else {
			client = await new elasticsearch.Client({
				host,
				log: 'trace'
			});
		}


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