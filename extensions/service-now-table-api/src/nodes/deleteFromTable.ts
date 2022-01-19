import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IDeleteFromTableParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		tableName: string;
		sysId: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const deleteFromTableNode = createNodeDescriptor({
	type: "deleteFromTable",
	defaultLabel: "Delete From Table",
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
			label: "System Id",
			description: "The id of the entry you want to delete.",
			type: "cognigyText",
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
		{ type: "field", key: "sysId" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IDeleteFromTableParams) => {
		const { api } = cognigy;
		const { connection, tableName, sysId, storeLocation, inputKey, contextKey } = config;
		const { username, password, instance } = connection;

		try {
			const response = await axios.delete(`${instance}/api/now/table/${tableName}/${sysId}`, {
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
				api.addToContext(contextKey, `succefully deleted entry with id: ${sysId}`, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, `succefully deleted entry with id: ${sysId}`);
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