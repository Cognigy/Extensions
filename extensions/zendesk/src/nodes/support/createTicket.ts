import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ICreateTicketParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			subdomain: string;
		};
		subject: string;
		description: string;
		priority: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const createTicketNode = createNodeDescriptor({
	type: "createTicket",
	defaultLabel: {
		default: "Create Ticket",
		deDE: "Ticket erstellen",
		esES: "Crear Ticket"
	},
	summary: {
		default: "Creates a new support ticket",
		deDE: "Erstellt ein neues Support Ticket",
		esES: "Crea un nuevo ticket de soporte"
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
				connectionType: "zendesk",
				required: true
			}
		},
		{
			key: "subject",
			label: {
				default: "Subject",
				deDE: "Betreff",
				esES: "Tema"
			},
			type: "cognigyText",
			description: {
				default: "The subject of the new support ticket",
				deDE: "Der Betreff des neuen Tickets",
				esES: "El tema del nuevo ticket de soporte"
			},
			params: {
				required: true
			}
		},
		{
			key: "description",
			label: {
				default: "Description",
				deDE: "Beschreibung",
				esES: "Descripción"
			},
			type: "cognigyText",
			description: {
				default: "The description of the new support ticket",
				deDE: "Die Beschreibung des neuen Tickets",
				esES: "La descripción del nuevo ticket de soporte"
			},
			params: {
				required: true
			}
		},
		{
			key: "priority",
			label: {
				default: "Priority",
				deDE: "Priorität",
				esES: "Prioridad"
			},
			type: "select",
			description: {
				default: "The priority of the new support ticket",
				deDE: "Die Priorität des neuen Tickets",
				esES: "La prioridad del nuevo ticket de soporte"
			},
			defaultValue: "normal",
			params: {
				required: true,
				options: [
					{
						label: "Normal",
						value: "normal"
					},
					{
						label: "High",
						value: "high"
					},
					{
						label: "Urgent",
						value: "urgent"
					}
				]
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
				default: "Input Key to store Result",
				deDE: "Input Schlüssel",
				esES: "Input Key para almacenar el resultado"
			},
			defaultValue: "zendesk.ticket",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: {
				default: "Context Key to store Result",
				deDE: "Context Schlüssel",
				esES: "Context Key para almacenar el resultado"
			},
			defaultValue: "zendesk.ticket",
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
		{ type: "field", key: "subject" },
		{ type: "field", key: "description" },
		{ type: "field", key: "priority" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00363d"
	},
	function: async ({ cognigy, config }: ICreateTicketParams) => {
		const { api } = cognigy;
		const { connection, description, priority, subject, storeLocation, contextKey, inputKey } = config;
		const { username, password, subdomain } = connection;

		try {

			const response = await axios({
				method: "post",
				url: `https://${subdomain}.zendesk.com/api/v2/tickets`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				data: {
					ticket: {
						comment: {
							body: description
						},
						priority,
						subject
					}
				},
				auth: {
					username,
					password
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
				api.addToContext(contextKey, { error: error.message }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});