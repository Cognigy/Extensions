import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IGetCatalogRequestParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		requestNumber: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getCatalogRequestNode = createNodeDescriptor({
	type: "getCatalogRequest",
	defaultLabel: "Get Catalog Request",
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
			key: "requestNumber",
			label: "Request Number",
			description: "The number of the request; e.g. REQ0010002",
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
			defaultValue: "snow.request",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "snow.request",
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
		{ type: "field", key: "requestNumber" },
		{ type: "section", key: "storageOption" }
	],
	tokens: [
		{
			label: "Request Number",
			script: "ci.snow.request[0].number",
			type: "answer"
		},
		{
			label: "Request State",
			script: "ci.snow.request[0].request_state",
			type: "answer"
		}
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IGetCatalogRequestParams) => {
		const { api } = cognigy;
		const { connection, storeLocation, inputKey, contextKey, requestNumber } = config;
		const { username, password, instance } = connection;

		try {

			let query = "";

			query = requestNumber ? `number=${requestNumber}` : "";

			let url = `${instance}/api/now/table/sc_request?sysparm_query=${query}`;

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