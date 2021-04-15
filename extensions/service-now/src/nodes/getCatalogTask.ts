import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IGetCatalogTaskParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		limit: number;
		taskNumber: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getCatalogTaskNode = createNodeDescriptor({
	type: "getCatalogTask",
	defaultLabel: "Get Catalog Task",
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
			key: "taskNumber",
			label: "Task Number",
			description: "The number of the task; e.g. SCTASK0010003",
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
			defaultValue: "snow.task",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "snow.task",
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
		{ type: "field", key: "limit" },
		{ type: "field", key: "requestNumber" },
		{ type: "section", key: "storageOption" }
	],
	tokens: [
		{
			label: "Task Number",
			script: "ci.snow.task[0].number",
			type: "answer"
		},
		{
			label: "Task State",
			script: "ci.snow.task[0].state",
			type: "answer"
		},
		{
			label: "Task Description",
			script: "ci.task[0].description",
			type: "answer"
		}
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IGetCatalogTaskParams) => {
		const { api } = cognigy;
		const { connection, limit, storeLocation, inputKey, contextKey, taskNumber } = config;
		const { username, password, instance } = connection;

		try {

			let query = "";

			query = taskNumber ? `number=${taskNumber}` : "";

			let url = `${instance}/api/now/table/sc_task?sysparm_query=${query}&sysparm_limit=${limit}`;

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