import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface ICreateIncidentParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			instance: string;
		};
		shortDescription: string;
		urgency: string;
		impact: string;
		callerId: string;
		description: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

interface IIncidentData {
	short_description: string;
	urgency: string;
	impact: string;
	caller_id: string;
	description: string;
};

export const createIncidentNode = createNodeDescriptor({
	type: "createIncident",
	defaultLabel: "Create Incident",
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
			key: "shortDescription",
			label: "Short Description",
			description: "A short description of the incident.",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "urgency",
			label: "Urgency",
			description: "The urgency of the incident. E.g. 4.",
			type: "cognigyText",
			defaultValue: "4",
			params: {
				required: true
			}
		},
		{
			key: "impact",
			label: "Impact",
			description: "The impact of the incident. E.g. 4.",
			type: "cognigyText",
			defaultValue: "4",
			params: {
				required: true
			}
		},
		{
			key: "callerId",
			label: "Caller ID",
			description: "The ID of the person on behalf of which the incident is raised. E.g. David.Miller",
			type: "cognigyText",
			defaultValue: "David.Miller",
			params: {
				required: true
			}
		},
		{
			key: "description",
			label: "Description",
			description: "The full description of the incident.",
			type: "cognigyText",
			params: {
				required: true,
				multiline: true
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
			defaultValue: "snow.createdIncident",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "snow.createdIncident",
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
		{ type: "field", key: "shortDescription" },
		{ type: "field", key: "urgency" },
		{ type: "field", key: "impact" },
		{ type: "field", key: "callerId" },
		{ type: "field", key: "description" },
		{ type: "section", key: "storageOption" }
	],
	tokens: [
		{
			label: "Created Incident Number",
			script: "ci.snow.createdIncident.number",
			type: "answer"
		},
		{
			label: "Created Incident Description",
			script: "ci.snow.createdIncident.short_description",
			type: "answer"
		}
	],
	appearance: {
		color: "#80b6a1"
	},
	dependencies: {
		children: [
			"onSuccesCreatedIncident",
			"onErrorCreatedIncident"
		]
	},
	function: async ({ cognigy, config, childConfigs }: ICreateIncidentParams) => {
		const { api } = cognigy;
		const { connection, shortDescription, urgency, impact, callerId, description, storeLocation, inputKey, contextKey } = config;
		const { username, password, instance } = connection;

		try {

			const data: IIncidentData = {
				"short_description": shortDescription,
				"urgency": urgency,
				"impact": impact,
				"caller_id": callerId,
				"description": description
			};

			const response = await axios.post(`${instance}/api/now/table/incident`,
				data, {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				auth: {
					username,
					password
				},
			});

			const onSuccessChild = childConfigs.find(child => child.type === "onSuccesCreatedIncident");
			api.setNextNode(onSuccessChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data.result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data.result);
			}
		} catch (error) {

			const onErrorChild = childConfigs.find(child => child.type === "onErrorCreatedIncident");
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

export const onSuccesCreatedIncident = createNodeDescriptor({
	type: "onSuccesCreatedIncident",
	parentType: "createIncident",
	defaultLabel: "On Success",
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini"
	}
});

export const onErrorCreatedIncident = createNodeDescriptor({
	type: "onErrorCreatedIncident",
	parentType: "createIncident",
	defaultLabel: "On Error",
	appearance: {
		color: "#cf142b",
		textColor: "white",
		variant: "mini"
	}
});