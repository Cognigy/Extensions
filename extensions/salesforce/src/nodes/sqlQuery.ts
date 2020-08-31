import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const jsforce = require('jsforce');


export interface ISQLQueryParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			token: string;
		};
		soql: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const sqlQueryNode = createNodeDescriptor({
	type: "sqlQuery",
	defaultLabel: "SQL Query",
	preview: {
		key: "soql",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "Salesforce Credentials",
			type: "connection",
			params: {
				connectionType: "salesforce",
				required: true
			}
		},
		{
			key: "soql",
			label: "Salesforce SOQL Query",
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
			defaultValue: "news",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "news",
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
		{ type: "field", key: "soql" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#009EDB"
	},
	function: async ({ cognigy, config }: ISQLQueryParams) => {
		const { api } = cognigy;
		const { soql, connection, storeLocation, contextKey, inputKey } = config;
		const { token, password, username } = connection;

		return new Promise((resolve, reject) => {
			let result = {};
			const conn = new jsforce.Connection();

			conn.login(username, password + token, (err: any, res: any) => {
				if (err) {

					if (storeLocation === "context") {
						api.addToContext(contextKey, err, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, err);
					}
				} else {
					conn.query(soql, (err: any, res: any) => {
						if (err) {
							if (storeLocation === "context") {
								api.addToContext(contextKey, err, "simple");
							} else {
								// @ts-ignore
								api.addToInput(inputKey, err);
							}
						} else result = res;

						if (storeLocation === "context") {
							api.addToContext(contextKey, result, "simple");
						} else {
							// @ts-ignore
							api.addToInput(inputKey, response);
						}
					});
				}
			});

			resolve();
		});
	}
});