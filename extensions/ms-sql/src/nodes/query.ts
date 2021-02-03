import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const sql = require("mssql/msnodesqlv8");


export interface IQueryParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			user: string;
			password: string;
			domain: string;
			server: string;
			database: string;
		};
		query: string;
		storeLocation: string
		inputKey: string;
		contextKey: string;
	};
}

export const queryNode = createNodeDescriptor({
	type: "mssqlQuery",
	defaultLabel: "Query",
	fields: [
		{
			key: "connection",
			label: "Microsoft SQL Connection",
			type: "connection",
			params: {
				connectionType: "mssql",
				required: true
			}
		},
		{
			key: "query",
			label: "SQL Query",
			type: "cognigyText",
			defaultValue: "SELECT * FROM TABLE",
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
			defaultValue: "sql",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "sql",
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
				"contextKey",
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "query" },
		{ type: "section", key: "storageOption" },
	],
	function: async ({ cognigy, config }: IQueryParams) => {
		const { api } = cognigy;
		const { connection, query, storeLocation, inputKey, contextKey } = config;
		const { user, password, database, domain, server } = connection;

		try {
			const sqlConnection = new sql.ConnectionPool({
				user,
				password,
				domain,
				server,
				database,
				driver: 'msnodesqlv8',
				options: {
					trustedConnection: true
				}
			});

			await sqlConnection.connect();
			const response = await sqlConnection.query(query);

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
