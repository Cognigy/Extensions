import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IGetFromTableByIdParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		tableName: string;
		sysId: string;
		limit: number;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getFromTableByIdNode = createNodeDescriptor({
	type: "getFromTableById",
	defaultLabel: "Get From Table by Id",
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
			key: "tableName",
			label: "Table Name",
			description: "The name of the Service Now table you want to use for this request.",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "sysId",
			label: "Sys Id",
			description: "The sys_id value for the particular record.",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "limit",
			label: "Result Limit",
			description: "The limit of the shown results.",
			type: "number",
			defaultValue: 1,
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
		{ type: "field", key: "tableName" },
		{ type: "field", key: "sysId" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IGetFromTableByIdParams) => {
		const { api } = cognigy;
		const { connection, tableName, sysId, limit, storeLocation, inputKey, contextKey } = config;
		const { username, password, instance } = connection;

		try {
			const response = await axios.get(`${instance}/api/now/table/${tableName}/${sysId}`, {
				headers: {
					'Accept': 'application/json'
				},
				auth: {
					username,
					password
				},
				params: {
					sysparm_limit: limit
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