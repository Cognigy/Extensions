import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";
import { buildInboundUrl } from "../helpers/buildInboundUrl";

export interface IStartProcessParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			bearerToken: string;
			region: string;
			clusterId: string;
			inboundId: string;
		};
		text: string;
		data: object | string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

const defaultData = {
	event: "claim_initiated",
	timestamp: "2026-09-08T20:06:00Z",
	customer: {
		id: "CUST-12345",
		name: "John Mitchell",
		policy_number: "AZ-HOME-7841029",
		phone: "{{input.userId}}",
		email: "john.mitchell@email.com"
	},
	claim: {
		type: "property_damage",
		coverage_type: "water_damage",
		incident_date: "2026-09-08T19:30:00Z",
		description: "Burst pipe in basement; water damage to insulation and drywall",
		estimated_loss: 15000,
		hazards_identified: [
			"mold_risk",
			"structural_damage_potential"
		],
		safety_concern: false,
		policy_tier: "premium"
	},
	conversation: {
		session_id: "{{input.sessionId}}",
		duration_seconds: 270,
		sentiment: "anxious_but_cooperative",
		agent_id: "cognigy_ai_agent_01"
	}
};

export const startProcessNode = createNodeDescriptor({
	type: "startProcess",
	defaultLabel: {
		default: "Start Process"
	},
	summary: {
		default: "Starts a Camunda process through an inbound webhook connector"
	},
	fields: [
		{
			key: "connection",
			label: {
				default: "Camunda Connection"
			},
			type: "connection",
			params: {
				connectionType: "camunda",
				required: true
			}
		},
		{
			key: "text",
			label: {
				default: "Text"
			},
			type: "cognigyText",
			defaultValue: "{{input.text}}",
			description: {
				default: "The text that is sent to Camunda in the text property of the payload"
			}
		},
		{
			key: "data",
			label: {
				default: "Data"
			},
			type: "json",
			defaultValue: JSON.stringify(defaultData, null, 2),
			description: {
				default: "The process variables that are sent to Camunda in the data property of the payload"
			},
			params: {
				required: true
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: {
				default: "Where to store the result",
				deDE: "Wo das Ergebnis gespeichert werden soll"
			},
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
			}
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: {
				default: "Input Key to store Result",
				deDE: "Input Key zum Speichern des Ergebnisses"
			},
			defaultValue: "camunda",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: {
				default: "Context Key to store Result",
				deDE: "Context Key zum Speichern des Ergebnisses"
			},
			defaultValue: "camunda",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storage",
			label: {
				default: "Storage Option",
				deDE: "Speicheroption"
			},
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
		{ type: "field", key: "text" },
		{ type: "field", key: "data" },
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#FC5D0D"
	},
	dependencies: {
		children: [
			"onProcessStarted",
			"onProcessFailed"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IStartProcessParams) => {
		const { api, input } = cognigy;
		const { connection, text, data, storeLocation, inputKey, contextKey } = config;
		const { bearerToken, region, clusterId, inboundId } = connection;

		const storeResult = (result: object): void => {
			if (storeLocation === "context") {
				api.addToContext(contextKey, result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result);
			}
		};

		try {
			const payload = {
				sessionId: input.sessionId,
				text,
				userId: input.userId,
				data: typeof data === "string" ? JSON.parse(data) : data,
				URLToken: input.URLToken
			};

			const response = await axios({
				method: "post",
				url: buildInboundUrl(region, clusterId, inboundId),
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Authorization": `Bearer ${bearerToken}`
				},
				data: payload
			});

			const onStartedChild = childConfigs.find(child => child.type === "onProcessStarted");
			api.setNextNode(onStartedChild.id);

			storeResult({
				status: response.status,
				data: response.data
			});
		} catch (error) {
			api.log("error", `Camunda Start Process failed: ${error.message}`);

			const onFailedChild = childConfigs.find(child => child.type === "onProcessFailed");
			api.setNextNode(onFailedChild.id);

			storeResult({
				error: error.message,
				status: error.response?.status,
				data: error.response?.data
			});
		}
	}
});

export const onProcessStarted = createNodeDescriptor({
	type: "onProcessStarted",
	parentType: "startProcess",
	defaultLabel: {
		default: "Process Started"
	},
	constraints: {
		editable: false,
		deletable: false,
		creatable: false,
		movable: false,
		placement: {
			predecessor: {
				whitelist: []
			}
		}
	},
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini",
		showIcon: false
	}
});

export const onProcessFailed = createNodeDescriptor({
	type: "onProcessFailed",
	parentType: "startProcess",
	defaultLabel: {
		default: "Failed"
	},
	constraints: {
		editable: false,
		deletable: false,
		creatable: false,
		movable: false,
		placement: {
			predecessor: {
				whitelist: []
			}
		}
	},
	appearance: {
		color: "#cf142b",
		textColor: "white",
		variant: "mini",
		showIcon: false
	}
});
