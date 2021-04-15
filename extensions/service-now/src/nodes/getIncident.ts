import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IGetIncidentParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		limit: number;
		incidentNumber: string;
		caller: string;
		category: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getIncidentNode = createNodeDescriptor({
	type: "getIncident",
	defaultLabel: "Get Incident",
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
			key: "incidentNumber",
			label: "Incident Number",
			description: "The number of the incident; e.g. INC012345",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: false
			}
		},
		{
			key: "caller",
			label: "The user that submitted the incident",
			description: "The user that submitted the incident; e.g. David.Miller ",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: false
			}
		},
		{
			key: "category",
			label: "Incident Category",
			description: "The category of the incident; e.g. Software",
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
			defaultValue: "snow.incident",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "snow.incident",
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
		{ type: "field", key: "incidentNumber" },
		{ type: "field", key: "caller" },
		{ type: "field", key: "category" },
		{ type: "section", key: "storageOption" }
	],
	tokens: [
		{
			label: "Incident Number",
			script: "ci.snow.incident[0].number",
			type: "answer"
		},
		{
			label: "Incident Caller",
			script: "ci.snow.incident[0].caller_id.value",
			type: "answer"
		},
		{
			label: "Incident Status",
			script: "ci.snow.incident[0].state",
			type: "answer"
		},
		{
			label: "Incident Short Description",
			script: "ci.snow.incident[0].short_description",
			type: "answer"
		},
		{
			label: "Incident Severity",
			script: "ci.snow.incident[0].severity",
			type: "answer"
		},
		{
			label: "Incident Category",
			script: "ci.snow.incident[0].category",
			type: "answer"
		},
		{
			label: "Incident Opened At",
			script: "ci.snow.incident[0].opened_at",
			type: "answer"
		},
		{
			label: "Incident Updated On",
			script: "ci.snow.incident[0].sys_updated_on",
			type: "answer"
		}
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IGetIncidentParams) => {
		const { api } = cognigy;
		const { connection, limit, storeLocation, inputKey, contextKey, incidentNumber, caller, category } = config;
		const { username, password, instance } = connection;

		try {

			let query = "";

			query = incidentNumber ? `number=${incidentNumber}` : "";
			query = category ? query + `category=${category}` : query;
			query = caller ? query + `caller=${caller}` : query;

			let url = `${instance}/api/now/table/incident?sysparm_query=${query}&sysparm_limit=${limit}`;

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