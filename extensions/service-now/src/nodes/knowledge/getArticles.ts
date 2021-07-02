import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IGetArticlesParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		query: string;
		limit: number;
        offset: number;
        filter: string;
        fields: string;
        kb: string;
        language: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getArticlesNode = createNodeDescriptor({
	type: "getArticles",
	defaultLabel: "Search Articles (Knowledge)",
	fields: [
		{
			key: "connection",
			label: "Service Now Connection",
			type: "connection",
			params: {
				connectionType: "snow",
				required: false
			}
		},
        {
			key: "query",
			label: "Query",
			description: "Text to search for",
			type: "cognigyText",
            defaultValue: "",
			params: {
				required: false
			}
		},
        {
			key: "limit",
			label: "Limit",
			description: "Maximum number of records",
			type: "number",
            defaultValue: 30,
			params: {
				required: false
			}
		},
        {
			key: "offset",
			label: "Offset",
			description: "Starting record index for which to begin retrieving records",
			type: "number",
            defaultValue: 0,
			params: {
				required: false
			}
		},
        {
			key: "filter",
			label: "Filter",
			description: "Encoded query to use to filter the result set",
			type: "cognigyText",
            defaultValue: "",
			params: {
				required: false
			}
		},
		{
			key: "fields",
			label: "Fields",
			description: "Comma separated list of fields from the Knowledge table to show details in results",
			type: "cognigyText",
            defaultValue: "",
			params: {
				required: false
			}
		},
        {
			key: "kb",
			label: "Kb",
			description: "Comma separated list of knowledge base from the Knowledge Bases table to restrict results to",
			type: "cognigyText",
            defaultValue: "",
			params: {
				required: false
			}
		},
        {
			key: "language",
			label: "Language",
			description: "List of comma separated languages in two-letter ",
			type: "cognigyText",
            defaultValue: "",
			params: {
				required: false
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
			defaultValue: "snow",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "snow",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"limit",
                "filter",
                "fields",
                "kb",
                "language",
                "offset"
			]
		},
		{
			key: "storageOption",
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
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IGetArticlesParams) => {
		const { api } = cognigy;
		const { connection, query, limit, filter, fields, kb, language, offset, storeLocation, inputKey, contextKey } = config;
		const { username, password, instance } = connection;

		try {
			const response = await axios.get(`${instance}/api/sn_km_api/knowledge/articles`, {
				headers: {
					'Accept': 'application/json'
				},
				auth: {
					username,
					password
				},
				params: {
					limit,
                    query,
                    filter,
                    fields,
                    kb,
                    offset,
                    language
				}
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data.result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data.result);
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error.message }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});