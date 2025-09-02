import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ISearchParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			domain: string;
			email: string;
			key: string;
		};
		query: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const searchtNode = createNodeDescriptor({
	type: "search",
	defaultLabel: "Search",
	preview: {
		key: "query",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "Confluence Connection",
			type: "connection",
			params: {
				connectionType: "confluence",
				required: true
			}
		},
		{
			key: "query",
			label: "Query",
			type: "cognigyText",
			params: {
				required: true,
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
			defaultValue: "confluence.result",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "confluence.result",
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
		color: "#0052CC"
	},
	function: async ({ cognigy, config }: ISearchParams) => {
		const { api } = cognigy;
		const { query, connection, storeLocation, contextKey, inputKey } = config;
		const { domain, email, key } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `${domain}/wiki/rest/api/content/search?cql=type=page+and+text~"${query}"+order+by+id+asc&expand=body.storage`,
				headers: {
					'Content-Type': 'application/json'
				},
				auth: {
					username: email,
					password: key
				}
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				api.addToInput(inputKey, response.data);
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				api.addToInput(inputKey, error.message);
			}
		}
	}
});
