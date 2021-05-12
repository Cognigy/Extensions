import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IPostToTableParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		tableName: string;
		data: any;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const postToTableNode = createNodeDescriptor({
	type: "postToTable",
	defaultLabel: "Post To Table",
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
			key: "data",
			label: "Data",
			description: "The data of the row you want to add.",
			type: "json",
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
		{ type: "field", key: "data" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IPostToTableParams) => {
		const { api } = cognigy;
		const { connection, tableName, data, storeLocation, inputKey, contextKey } = config;
		const { username, password, instance } = connection;

		try {
			const response = await axios.post(`${instance}/api/now/table/${tableName}`,
				data, {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				auth: {
					username,
					password
				},
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