import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/** Default request body for a Kofax RPA request: */
const defaultBody = JSON.stringify({
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
}, null, 2);


export interface IRunRobotParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
		};
		rpaServer: string;
		projectName: string;
		robotName: string;
		inputAs: "variables" | "json";
		variables: string[];
		includeInjectDetails: boolean;
		json: any;
		timeout: number;
		resultAttribute: string;

		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const runRobotNode = createNodeDescriptor({
	type: "runRobot",
	defaultLabel: "Run Robot",
	preview: {
		key: "robotName",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "RPA REST Credentials",
			type: "connection",
			params: {
				connectionType: "kofax-rpa",
				required: true
			}
		},
		{
			key: "rpaServer",
			type: "cognigyText",
			label: "RPA REST server url",
			defaultValue: "http://myserver:50080",
			params: { required: true, },
		},
		{
			key: "projectName",
			type: "cognigyText",
			label: "RPA Project Name",
			defaultValue: "Default project",
			params: { required: true, },
		},
		{
			key: "robotName",
			type: "cognigyText",
			label: "Robot Name",
			defaultValue: "Robot 1",
			params: { required: true, },
		},
		{
			key: "inputAs",
			type: "select",
			label: "Configure inputs as:",
			defaultValue: "variables",
			params: {
				options: [
					{
						label: "Variable:Attributes",
						value: "variables"
					},
					{
						label: "JSON payload",
						value: "json"
					}
				],
				required: true
			},
		},
		{
			key: "variables",
			type: "textArray",
			label: "Variable:Attribute:Type=Value",
			defaultValue: ["myVariable:myAttribute:text=Some value"],
			condition: {
				key: "inputAs",
				value: "variables",
			},
		},
		{
			key: "includeInjectDetails",
			type: "toggle",
			label: "Include Cognigy Inject Details",
			defaultValue: true,
			condition: {
				key: "inputAs",
				value: "variables",
			},
		},
		{
			key: "json",
			label: "Robot Input Data",
			type: "json",
			defaultValue: defaultBody,
			condition: {
				key: "inputAs",
				value: "json",
			},
		},
		{
			key: "timeout",
			label: "Request Timeout (milliseconds)",
			type: "number",
			// Cognigy will timeout Extension methods at 20s, and throw an error, so we default to just under that:
			defaultValue: 19000,
			params: { required: true, },
		},
		{
			key: "resultAttribute",
			type: "cognigyText",
			label: "Result Attribute (optional)",
			params: { required: false },
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
			key: "robot",
			label: "Robot Selection",
			defaultCollapsed: false,
			fields: [
				"rpaServer",
				"projectName",
				"robotName"
			]
		},
		{
			key: "inputs",
			label: "Input Parameters",
			defaultCollapsed: false,
			fields: [
				"inputAs",
				"variables",
				"includeInjectDetails",
				"json"
			]
		},
		{
			key: "storage",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"resultAttribute",
				"storeLocation",
				"inputKey",
				"contextKey"
			]
		}

	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "section", key: "robot" },
		{ type: "section", key: "inputs" },
		{ type: "field", key: "timeout" },
		{ type: "section", key: "storage" },
	],
	function: async ({ cognigy, config }: IRunRobotParams) => {
		const { connection, rpaServer, projectName, robotName, inputAs, variables, includeInjectDetails, json, resultAttribute, storeLocation, inputKey, contextKey } = config;
		const timeout = Number(config.timeout);
		const { api } = cognigy;

		// Check if the secret is given
		if (!rpaServer) throw new Error("The RPA Server url is missing. eg http://roboserver:50080 or http://roboserver:8080/ManagementConsole/");
		if (!projectName) throw new Error("The RPA Project Name is missing. e.g. 'Default project'");
		if (!robotName) throw new Error("The RPA Robot Name is missing");
		if (timeout < 1 || timeout > 19000) throw new Error("Timeout (milliseconds) must be between 1 and 19000");

		// Create the post url for the Kofax RPA REST Service
		const robotNameClean = robotName.match(/[.]robot$/i) ? robotName : `${robotName}.robot`;   // - Add ".robot" if needed
		const url = `${rpaServer}/rest/run/${projectName}/${robotNameClean}`;

		/** Body content, from config.json or derived from config.variables: */
		let body: any;

		if (inputAs === 'json') {
			body = json;
		} else if (inputAs === 'variables') {
			// Create a body object like:
			// {
			// 	"parameters": [
			// 		{
			// 			"variableName": "searchItem",
			// 			"attribute": [
			// 				{
			// 					"type": "text",
			// 					"name": "searchItem",
			// 					"value": "hammer"
			// 				}
			// 			]
			// 		}
			// 	]
			// }
			//
			// From multiple strings like: "myVariable:myAttribute:text=some value"
			if (includeInjectDetails) {
				// Add these standard variables, for the inject functionality, if requested:
				variables.push(
					`cognigyInjectDetails:userId:text=${cognigy.input.userId}`,
					`cognigyInjectDetails:sessionId:text=${cognigy.input.sessionId}`,
					`cognigyInjectDetails:URLToken:text=${cognigy.input.URLToken}`
				);
			}
			body = { parameters: [] };
			for (let variableAttributeSpec of variables) {
				// Extract all the parts of the string spec
				const [spec, value] = variableAttributeSpec.split('=', 2);        // - First split around '='
				const [variableName, attributeName, type] = spec.split(':', 3);   // - Then split on the ':'s
				// Check for all values supplied:
				if (!spec || !value || !variableName || !attributeName || !type) {
					throw new Error("Malformed Variable:Attribute spec. Please follow the format: myVariable:myAttribute:text=some value");
				}

				// There may be multiple attributes in a variable, so check if variable exists already:
				let variable = body.parameters.find(p => p.variableName === variableName);
				if (!variable) {
					// If not, create it and add to array:
					variable = { variableName, attribute: [] };
					body.parameters.push(variable);
				}
				// And add the attribute:
				variable.attribute.push({ type, name: attributeName, value });
			}
		}

		const request: AxiosRequestConfig = {
			method: "post",
			url,
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
			data: body,
			timeout,
		};
		if (connection && connection.username && connection.password) {
			// Add auth property to query options:
			const { username, password } = connection;
			request.auth = { username, password };
		}

		try {
			const axiosResponse: AxiosResponse = await axios(request);

			// Minify the axiosResponse which has a lot of crud in it:
			const { data, status, statusText, headers } = axiosResponse;
			// Note that the response ends up in "response.response", so it is clearly labelled in the return structure:
			let response: any = { response: { data, status, statusText, headers } };

			// If a 'resultAttribute' is defined, and it's found in the result, then return it instead of the full response:
			if (resultAttribute && response.response?.data?.values?.length > 0) {
				const attribute = response.response.data.values.find(a => a.name === resultAttribute);
				// As for 'response', this is clearly labelled with "resultAttribute":
				if (attribute) response = { resultAttribute: attribute };
			}

			// By here, the 'response' will be formatted like either:
			// { response: <minified Axios response> }
			// OR:
			// { resultAttribute: {name: "selectedAttribute", value: "someValue"} }

			if (storeLocation === 'context' && contextKey) {
				api.addToContext(contextKey, response, "simple");
			} else if (storeLocation === 'input' && inputKey) {
				cognigy.input[inputKey] = response;
			}
		} catch (error) {
			console.error("Error from request to Kofax:", error.message);
			const errReturn = { errorMessage: error.message, errorCode: error.code };
			if (storeLocation === "context") {
				api.addToContext(contextKey, errReturn, "simple");
			} else {
				cognigy.input[inputKey] = errReturn;
			}
		}
	}

});