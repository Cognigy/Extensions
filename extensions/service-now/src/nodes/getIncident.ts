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
	summary: "Get an incident from Service Now",
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
			description: "The limit of the shown results",
			type: "number",
			defaultValue: 1
		},
		{
			key: "incidentNumber",
			label: "Incident Number",
			description: "The number of the incident; e.g. INC012345",
			type: "cognigyText",
			params: {
				required: false
			}
		},
		{
			key: "caller",
			label: "The user that submitted the incident",
			description: "The user that submitted the incident; e.g. David.Miller ",
			type: "cognigyText",
			params: {
				required: false
			}
		},
		{
			key: "category",
			label: "Incident Category",
			description: "The category of the incident; e.g. Software",
			type: "cognigyText",
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
		},
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"limit"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "incidentNumber" },
		{ type: "field", key: "caller" },
		{ type: "field", key: "category" },
		{ type: "section", key: "advanced" },
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
	function: async ({ cognigy, config, childConfigs }: IGetIncidentParams) => {
		const { api } = cognigy;
		const { connection, limit, storeLocation, inputKey, contextKey, incidentNumber, caller, category } = config;
		const { username, password, instance } = connection;

		try {

			let query: string = "";

			query = incidentNumber ? `number=${incidentNumber}` : "";
			query = category ? query + `category=${category}` : query;
			query = caller ? query + `caller=${caller}` : query;

			let url: string = `${instance}/api/now/table/incident?sysparm_query=${query}&sysparm_limit=${limit}`;

			const response = await axios.get(url, {
				headers: {
					'Accept': 'application/json'
				},
				auth: {
					username,
					password
				}
			});

			const onSuccessChild = childConfigs.find(child => child.type === "onSuccesGetIncident");
			api.setNextNode(onSuccessChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data.result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data.result);
			}
		} catch (error) {

			const onErrorChild = childConfigs.find(child => child.type === "onErrorGetIncident");
			api.setNextNode(onErrorChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error.message }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});

export const onSuccesGetIncident = createNodeDescriptor({
	type: "onSuccesGetIncident",
	parentType: "getIncident",
	defaultLabel: "On Success",
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini"
	}
});

export const onErrorGetIncident = createNodeDescriptor({
	type: "onErrorGetIncident",
	parentType: "getIncident",
	defaultLabel: "On Error",
	appearance: {
		color: "#cf142b",
		textColor: "white",
		variant: "mini"
	}
});