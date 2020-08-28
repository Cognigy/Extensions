import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IDetectLanguageInTextParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		body: any;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const runRobotNode = createNodeDescriptor({
	type: "runRobot",
	defaultLabel: "Run Robot",
	preview: {
		key: "robot",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "RPA API Key",
			type: "connection",
			params: {
				connectionType: "kofax-rpa",
				required: true
			}
		},
		{
			key: "body",
			label: "Robot Data",
			description: "The data body for the RPA Post Request.",
			type: "json",
			defaultValue: `
			{
				"urlToForward": "http://ip:50080/rest/run/Defaultproject/SearchHardware.robot",
				"bodyToFoward": {
				  "parameters": [
					{
					  "variableName": "searchItem",
					  "attribute": [
						{
						  "type": "text",
						  "name": "searchItem",
						  "value": "hammer"
						}
					  ]
					}
				  ]
				}
			  }
			`,
			params: {
				required: true,
			},
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
			defaultValue: "kofax",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "kofax",
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
		{ type: "field", key: "body" },
		{ type: "section", key: "storage" },
	],
	function: async ({ cognigy, config }: IDetectLanguageInTextParams) => {
		const { api } = cognigy;
		const { body, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		try {
			const response = await axios.post(`https://request-forwarder.cognigy.ai/forward`, body, {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'X-API-Key': key
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
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});