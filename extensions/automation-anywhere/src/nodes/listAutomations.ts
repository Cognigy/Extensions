import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
import authenticate from "../helpers/authenticate";


export interface IListAutomationsParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			url: string;
			username: string;
			password: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const listAutomationsNode = createNodeDescriptor({
	type: "listAutomations",
	defaultLabel: "List Automations",
	fields: [
		{
			key: "connection",
			label: "Automation Anywhere Connection",
			type: "connection",
			params: {
				connectionType: "automation-anywhere",
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
			defaultValue: "automationAnywhere",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "automationAnywhere",
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
		},
		{
			key: "connectionSection",
			label: "Connection",
			defaultCollapsed: false,
			fields: [
				"connection",
			]
		},
	],
	form: [
		{ type: "section", key: "connectionSection" },
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#FAAB1C"
	},
	function: async ({ cognigy, config }: IListAutomationsParams) => {
		const { api, input } = cognigy;
		const { connection, contextKey, inputKey, storeLocation } = config;
		const { url, username, password } = connection;

		try {
			const options  = await authenticate(true, url, username, password, '', [], {});

			const response = await axios.post(`${url}/v2/repository/file/list`, {}, options);

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
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