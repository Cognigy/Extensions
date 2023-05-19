import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
const qs = require('qs');

export interface IExecuteQueriesParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			clientId: string;
			tenantId: string;
			username: string;
			password: string;
		}
		datasetId: string;
		query: string;
		impersonatedUserName: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const executeQueriesNode = createNodeDescriptor({
	type: "executeQueries",
	defaultLabel: "Execute Query",
	summary: "Executes Data Analysis Expressions (DAX) query against the provided dataset",
	fields: [
		{
			key: "connection",
			label: {
				default: "PowerBI Connection"
			},
			type: "connection",
			params: {
				connectionType: "powerBI",
				required: true
			}
		},
		{
			key: "datasetId",
			label: "Dataset ID",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "query",
			label: "Query",
			type: "cognigyText",
			description: "The query, such as EVALUATE VALUES(MyTable)",
			defaultValue: "EVALUATE VALUES(MyTable)",
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
			defaultValue: "query",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "query",
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
		{ type: "field", key: "datasetId" },
		{ type: "field", key: "query" },
		{ type: "field", key: "impersonatedUserName" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: '#F2CC40'
	},
	function: async ({ cognigy, config }: IExecuteQueriesParams) => {
		const { api } = cognigy;
		const { connection, datasetId, query, storeLocation, inputKey, contextKey } = config;
		const { clientId, username, password, tenantId } = connection;

		try {

			// Authenticate the request
			const authRequestData = qs.stringify({
				'grant_type': 'password',
				'resource': 'https://analysis.windows.net/powerbi/api',
				'client_id': clientId,
				'scope': 'https://analysis.windows.net/powerbi/api/.default',
				'username': username,
				'password': password
			});

			const authResponse = await axios({
				method: 'post',
				url: `https://login.microsoftonline.com/${tenantId}/oauth2/token`,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Accept': 'application/json'
				},
				data: authRequestData
			});

			const response = await axios({
				method: 'post',
				url: `https://api.powerbi.com/v1.0/myorg/datasets/${datasetId}/executeQueries`,
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': `Bearer ${authResponse.data.access_token}`
				},
				data: {
					queries: [
						{
							query
						}
					],
					serializerSettings: {
						includeNulls: true
					},
					impersonatedUserName: username
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