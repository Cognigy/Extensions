import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetAccountStatusParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			accessToken: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
		useDepartmentId: boolean;
		departmentId: string;
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
		default: "Checks if an agent is available in Zendesk Chat",
		deDE: "Überprüft ob ein Agent in Zendesk Chat verfügbar ist",
		esES: "Comprueba si hay un agente disponible en Zendesk Chat"
	},
	fields: [
		{
			key: "connection",
			label: {
				default: "Zendesk Connection",
				deDE: "Zendesk Verbindung",
				esES: "Zendesk Conexión"
			},
			type: "connection",
			params: {
				connectionType: "zendesk-chat",
				required: true
			}
		},
		{
			key: "useDepartmentId",
			type: "toggle",
			label: {
				default: "Use Department ID",
				deDE: "Department ID benutzen",
				esES: "Usar ID de departamento"
			},
			description: {
				default: "Only check availability for a certain department?",
				deDE: "Prüfe Verfügbarkeit für ein spezifische Department?",
				esES: "¿Solo consultar disponibilidad para un determinado departamento?"
			},
			defaultValue: false
		},
		{
			key: "departmentId",
			label: {
				default: "Department ID",
				deDE: "Department ID",
				esES: "Department ID"
			},
			type: "cognigyText",
			description: {
				default: "The department ID you wish to check.",
				deDE: "Die Department ID, die sie prüfen wollen.",
				esES: "El ID del departamento que desea verificar."
			},
			params: {
				required: false,
			},
			condition: {
				key: "useDepartmentId",
				value: true
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
			defaultValue: "zendesk.liveAgentAvailability",
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
			defaultValue: "zendesk.liveAgentAvailability",
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
		{ type: "field", key: "useDepartmentId" },
		{ type: "field", key: "departmentId" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00363d"
	},
	dependencies: {
		children: [
			"onAgentAvailable",
			"onNoAgentAvailable"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IGetAccountStatusParams) => {
		const { api } = cognigy;
		const { connection, storeLocation, useDepartmentId, departmentId, contextKey, inputKey } = config;
		const { accessToken } = connection;

		let endpoint;

		if (useDepartmentId === true) {
			endpoint =  `https://rtm.zopim.com/stream/agents?department_id=${departmentId}`;
		} else {
			endpoint = `https://rtm.zopim.com/stream/agents`;
		}

		try {

			const response = await axios({
				method: "get",
				url: endpoint,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Authorization": `Bearer ${accessToken}`
				},
			});

			if (response.data?.content?.data?.agents_online === 0) {
				const onOfflineChild = childConfigs.find(child => child.type === "onNoAgentAvailable");
				api.setNextNode(onOfflineChild.id);

				if (storeLocation === "context") {
					api.addToContext(contextKey, response.data, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, response.data);
				}
			} else {
				const onAvailableChild = childConfigs.find(child => child.type === "onAgentAvailable");
				api.setNextNode(onAvailableChild.id);

				if (storeLocation === "context") {
					api.addToContext(contextKey, response.data, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, response.data);
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
		default: "Is Online",
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
		default: "Is Offline",
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