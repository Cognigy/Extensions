import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const zendesk = require('node-zendesk');

export interface IQueryParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			token: string;
			remoteUri: string;
		};
		query: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const queryNode = createNodeDescriptor({
	type: "query",
	defaultLabel: "Query",
	preview: {
		key: "query",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "Zendesk Connection",
			type: "connection",
			params: {
				connectionType: "zendesk",
				required: true
			}
		},
		{
			key: "query",
			label: "Query",
			type: "cognigyText",
			defaultValue: "{{input.text}}",
			description: "The query to execute.",
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
			defaultValue: "zendesk.query",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "zendesk.query",
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
		color: "#00363d"
	},
	function: async ({ cognigy, config }: IQueryParams) => {
		const { api } = cognigy;
		const { query, connection, storeLocation, contextKey, inputKey } = config;
		const { username, token, remoteUri } = connection;

		const client = zendesk.createClient({
			username,
			token,
			remoteUri
		});

		return new Promise((resolve, reject) => {
			client.search.query(query, (err, statusCode, body, response, res) => {

				if (err) {
					if (storeLocation === "context") {
						api.addToContext(contextKey, { error: err.message }, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, { error: err.message });
					}

				}

				if (storeLocation === "context") {
					api.addToContext(contextKey, body, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, body);
				}

				resolve();
			});
		});
	}
});