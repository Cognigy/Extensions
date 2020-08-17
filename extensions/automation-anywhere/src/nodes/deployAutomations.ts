import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
import authenticate from "../helpers/authenticate";


export interface IDeployAutomationsParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			url: string;
			username: string;
			password: string;
		};
		fileId: string;
		deviceIds: string[];
		botVariables: object;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const deployAutomationsNode = createNodeDescriptor({
	type: "deployAutomations",
	defaultLabel: "Deploy Automations",
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
			key: "fileId",
			label: "File Id",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: true
			}
		},
		{
			key: "deviceIds",
			label: "Device Ids",
			type: "textArray",
			defaultValue: "",
			params: {
				required: true
			}
		},
		{
			key: "botVariables",
			label: "Bot Variables",
			type: "json",
			defaultValue: `{
	"variable1": {
		"string": "value"
	},
	"variable2": {
		"list": [
			"value1",
			"value2"
		]
	},
}
			`,
			params: {
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
		{ type: "field", key: "fileId" },
		{ type: "field", key: "deviceIds" },
		{ type: "field", key: "botVariables" },
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#FAAB1C"
	},
	function: async ({ cognigy, config }: IDeployAutomationsParams) => {
		const { api, input } = cognigy;
		const { connection, fileId, deviceIds, botVariables, contextKey, inputKey, storeLocation } = config;
		const { url, username, password } = connection;

		if (!fileId) throw new Error('No file id defined.');
		if (!deviceIds) throw new Error('No device ids defined.');

		try {
			const options  = await authenticate(true, url, username, password, fileId, deviceIds, botVariables);

			const response = await axios({
			  method: 'post',
			  url: `${url}/v2/automations/deploy`,
			  headers: { 'X-Authorization': options['headers']['X-Authorization'] },
			  data: options['body']
			});

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