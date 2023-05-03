import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IExecuteQueriesParams extends INodeFunctionBaseParams {
	config: {
		datasetId: string;
		queryStrings: string[];
		impersonatedUserName: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const executeQueriesNode = createNodeDescriptor({
	type: "executeQueries",
	defaultLabel: "Execute Queries",
	fields: [
		{
			key: "datasetId",
			label: "Dataset ID",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "queryStrings",
			label: "Queries",
			type: "textArray",
			description: "The list of queries, such as EVALUATE VALUES(MyTable)"
		},
		{
			key: "impersonatedUserName",
			label: "Impersonated Username",
			type: "cognigyText",
			description: "The Microsoft PowerBI Username, such as user@company.com"
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
			defaultValue: "msFlows",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "msFlows",
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
		{ type: "field", key: "datasetId" },
		{ type: "field", key: "queryStrings" },
		{ type: "field", key: "impersonatedUserName" },
		{ type: "section", key: "storageOption" }
	],

	function: async ({ cognigy, config }: IExecuteQueriesParams) => {
		const { api } = cognigy;
		const { datasetId, queryStrings, impersonatedUserName, storeLocation, inputKey, contextKey } = config;

		let queryObjectsArray: any[] = [];
		for (let queryString of queryStrings) {
			queryObjectsArray.push({
				query: queryString
			});
		}

		try {
			const response = await axios({
				method: 'post',
				url: `https://api.powerbi.com/v1.0/myorg/datasets/${datasetId}/executeQueries`,
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				data: {
					queries: queryObjectsArray,
					serializerSettings: {
						includeNulls: true
					},
					impersonatedUserName
				}
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