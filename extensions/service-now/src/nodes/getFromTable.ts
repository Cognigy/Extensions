import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IGetFromTableParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		tableName: string;
		limit: number;
		incidentNumber: string;
		caller: string;
		category: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getFromTableNode = createNodeDescriptor({
	type: "getFromTable",
	defaultLabel: "Get From Table",
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
			key: "limit",
			label: "Result Limit",
			description: "The limit of the shown results.",
			type: "number",
			defaultValue: 1,
			params: {
				required: true
			}
		},
		{
			key: "incidentNumber",
			label: "Incident Number",
			description: "The number of the incident; e.g. INC012345",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: false
			}
		},
		{
			key: "caller",
			label: "The user that submitted the incident",
			description: "The user that submitted the incident; e.g. David.Miller ",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: false
			}
		},
		{
			key: "category",
			label: "Incident Category",
			description: "The category of the incident; e.g. Software",
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
				"incidentNumber",
				"caller",
				"category"
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
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IGetFromTableParams) => {
		const { api } = cognigy;
		const { connection, tableName, limit, storeLocation, inputKey, contextKey, incidentNumber, caller, category } = config;
		const { username, password, instance } = connection;

		try {

			let query = "";

			query = incidentNumber ? `number=${incidentNumber}` : "";
			query = category ? query + `category=${category}` : query;
			query = caller ? query + `caller=${caller}` : query;

			let url = `${instance}/api/now/table/${tableName}?sysparm_query=${query}&sysparm_limit=${limit}`;

			const response = await axios.get(url, {
				headers: {
					'Accept': 'application/json'
				},
				auth: {
					username,
					password
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