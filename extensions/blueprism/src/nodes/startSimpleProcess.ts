import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IStartSimpleProcessParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
		};
		processWSDL: string;
		processName: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const startSimpleProcessNode = createNodeDescriptor({
	type: "startSimpleProcess",
	defaultLabel: "Start Simple Process",
	fields: [
		{
			key: "connection",
			label: "Blueprism Connection",
			type: "connection",
			params: {
				connectionType: "blueprism",
				required: true
			}
		},
		{
			key: "processWSDL",
			label: "The Exposed Process Endpoint Url",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "processName",
			label: "The Name of the Exposed Process",
			type: "cognigyText",
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
			defaultValue: "blueprism",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "blueprism",
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
		}
	],
	form: [
		{ type: "section", key: "connectionSection" },
		{ type: "field", key: "processWSDL" },
		{ type: "field", key: "processName" },
		{ type: "section", key: "storage" },

	],
	appearance: {
		color: "#0F4B8F"
	},
	function: async ({ cognigy, config }: IStartSimpleProcessParams) => {
		const { api } = cognigy;
		const { connection, processName, processWSDL, storeLocation, contextKey, inputKey } = config;
		const { username, password } = connection;

		if (!processWSDL) throw new Error('No Blue Prism Process Web Service WSDL defined.');
		if (!processName) throw new Error('No process name defined.');

		try {
			const response = await axios({
				method: 'post',
				url: processWSDL,
				headers: {
					'Content-Type': 'text/xml'
				},
				auth: {
					username,
					password
				},
				data: `
			  <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				xmlns:xsd="http://www.w3.org/2001/XMLSchema"
				xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
				xmlns:urn="urn:blueprism:webservice:${processName}">
				  <soapenv:Header/>
				  <soapenv:Body>
					<urn:${processName} soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"/>
				  </soapenv:Body>
			  </soapenv:Envelope>
			  `
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