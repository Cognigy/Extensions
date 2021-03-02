import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetAllEmployeesParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
			company: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getAllEmployeesNode = createNodeDescriptor({
	type: "getAllEmployees",
	defaultLabel: "Get All Employees",
	fields: [
		{
			key: "connection",
			label: "Bamboo Connection",
			type: "connection",
			params: {
				connectionType: "bamboo",
				required: true
			}
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
			defaultValue: "bamboo.employees",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "bamboo.employees",
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
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#73C41D"
	},
	function: async ({ cognigy, config }: IGetAllEmployeesParams) => {
		const { api } = cognigy;
		const { connection, storeLocation, contextKey, inputKey } = config;
		const { key, company } = connection;

		try {

			const response = await axios({
				method: 'get',
				url: `https://${key}:x@api.bamboohr.com/api/gateway.php/${company}/v1/employees/directory`,
				headers: {
					"Accept": "application/json"
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