import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ICheckLiveAgentAvailabilityParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			apiKey: string;
			baseUrl: string;
			accountId: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const checkLiveAgentAvailabilityNode = createNodeDescriptor({
	type: "checkLiveAgentAvailability",
	defaultLabel: {
		default: "Check Agent Availability",
		deDE: "Überprüfe Agenten Verfügbarkeit",
		esES: "Verificar la disponibilidad del agente"
	},
	summary: {
		default: "Checks if an agent is available in Live Agent",
		deDE: "Überprüft ob ein Agent in Live Agent verfügbar ist",
		esES: "Comprueba si hay un agente disponible en Live Agent"
	},
	fields: [
		{
			key: "connection",
			label: {
				default: "Live Agent Connection",
				deDE: "Live Agent Verbindung",
				esES: "Live Agent Conexión"
			},
			type: "connection",
			params: {
				connectionType: "cognigy-live-agent-access-token",
				required: true
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: {
				default: "Where to store the result",
				deDE: "Wo das Ergebnis gespeichert werden soll",
				esES: "Dónde almacenar el resultado"
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
			},
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: {
				default: "Input Key to store result",
				deDE: "Input Key zum Speichern des Ergebnisses",
				esES: "Input Key para almacenar el resultado"
			},
			defaultValue: "agentsAvailable",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: {
				default: "Context Key to store result",
				deDE: "Context Key zum Speichern des Ergebnisses",
				esES: "Context Key para almacenar el resultado"
			},
			defaultValue: "agentsAvailable",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},
	],
	sections: [
		{
			key: "storage",
			label: {
				default: "Storage Option",
				deDE: "Speicheroption",
				esES: "Opción de almacenamiento"
			},
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
		{ type: "section", key: "storage" },
	],
	dependencies: {
		children: [
			"onAgentAvailable",
			"onNoAgentAvailable"
		]
	},
	function: async ({ cognigy, config, childConfigs }: ICheckLiveAgentAvailabilityParams) => {
		const { api } = cognigy;
		const { connection, storeLocation, contextKey, inputKey } = config;
		const { apiKey, baseUrl, accountId } = connection;

		try {

			const response = await axios({
				method: "get",
				url: `${baseUrl}/accounts/${accountId}/agents`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"api_access_token": apiKey
				},
			});

			const onlineAgents: any[] = response.data.filter((agent: any) => agent.availability_status === "online");

			if (onlineAgents?.length === 0) {
				const onOfflineChild = childConfigs.find(child => child.type === "onNoAgentAvailable");
				api.setNextNode(onOfflineChild.id);

				if (storeLocation === "context") {
					api.addToContext(contextKey, onlineAgents, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, onlineAgents);
				}
			} else {
				const onAvailableChild = childConfigs.find(child => child.type === "onAgentAvailable");
				api.setNextNode(onAvailableChild.id);

				if (storeLocation === "context") {
					api.addToContext(contextKey, onlineAgents, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, onlineAgents);
				}
			}
		} catch (error) {

			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error });
			}
		}
	}
});

export const onAgentAvailable = createNodeDescriptor({
	type: "onAgentAvailable",
	parentType: "checkLiveAgentAvailability",
	defaultLabel: {
		default: "On Online",
		deDE: "Ist Online",
		esES: "Está en línea"
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
		variant: "mini"
	}
});

export const onNoAgentAvailable = createNodeDescriptor({
	type: "onNoAgentAvailable",
	parentType: "checkLiveAgentAvailability",
	defaultLabel: {
		default: "On Offline",
		deDE: "Ist Offline",
		esES: "Está desconectado"
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
		variant: "mini"
	}
});