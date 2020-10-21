import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface ICreateIncidentParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			server: string;
		};
		firstname: string;
		lastname: string;
		description: string;
		impact: string;
		urgency: string;
		status: string;
		serviceType: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const createIncidentNode = createNodeDescriptor({
	type: "createIncident",
	defaultLabel: "Create Incident",
	fields: [
		{
			key: "connection",
			label: "BMC Connection",
			type: "connection",
			params: {
				connectionType: "bmc",
				required: true
			}
		},
		{
			key: "firstname",
			label: "First Name",
			type: "cognigyText",
			params: {
				required: true,
			}
		},
		{
			key: "lastname",
			label: "Last Name",
			type: "cognigyText",
			params: {
				required: true,
			}
		},
		{
			key: "description",
			label: "Description",
			type: "cognigyText",
			params: {
				required: true,
			}
		},
		{
			key: "impact",
			label: "Impact",
			description: "The impact of this new incident.",
			type: "cognigyText",
			params: {
				required: true,
			}
		},
		{
			key: "urgency",
			type: "select",
			label: "Urgency",
			params: {
				options: [
					{
						label: "Critical",
						value: "1-Critical"
					}
				],
				required: true
			},
			defaultValue: "1-Critical"
		},
		{
			key: "status",
			type: "select",
			label: "Status",
			params: {
				options: [
					{
						label: "Assigned",
						value: "Assigned"
					},
					{
						label: "Unassigned",
						value: "Unassigned"
					}
				],
				required: true
			},
			defaultValue: "Unassigned"
		},
		{
			key: "serviceType",
			label: "Service Type",
			description: "Someting like User Service Restoration.",
			type: "cognigyText",
			params: {
				required: true,
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
			defaultValue: "bmc.incident",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "bmc.incident",
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
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "firstname" },
		{ type: "field", key: "lastname" },
		{ type: "field", key: "description" },
		{ type: "field", key: "impact" },
		{ type: "field", key: "urgency" },
		{ type: "field", key: "status" },
		{ type: "field", key: "serviceType" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#f86e00"
	},
	function: async ({ cognigy, config }: ICreateIncidentParams) => {
		const { api } = cognigy;
		const { connection, firstname, lastname, description, impact, urgency, status, serviceType, storeLocation, inputKey, contextKey } = config;
		const { username, password, server } = connection;

		try {
			const authResponse = await axios({
				method: 'post',
				url: `${server}/api/jwt/login`,
				headers: {
					username,
					password,
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});

			const token = authResponse.data;

			try {
				const response = await axios({
					method: 'post',
					url: `${server}/api/arsys/v1/entry/HPD:IncidentInterface_Create`,
					headers: {
						'Authorization': `AR-JWT ${token}`,
						'Content-Type': 'application/json'
					},
					data: {
						"values": {
							"First_Name": firstname,
							"Last_Name": lastname,
							"Description": description,
							"Impact": impact,
							"Urgency": urgency,
							"Status": status,
							"Reported Source": "Direct Input",
							"Service_Type": serviceType,
							"z1D_Action": "CREATE"
						 }
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