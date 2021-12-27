import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IGetTicketParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			subdomain: string;
		};
		ticketId: number;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getTicketNode = createNodeDescriptor({
	type: "getTicket",
	defaultLabel: {
		default: "Get Ticket",
		deDE: "Erhalte Ticket",
		esES: "Obtener Ticket"
	},
	summary: {
		default: "Retrieves the information about a given ticket",
		deDE: "Erhält alle Infos über ein bestimmtes Ticket",
		esES: "Recupera la información sobre un ticket determinad"
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
			key: "ticketId",
			label: "Ticket ID",
			type: "cognigyText",
			description: {
				default: "The ID of the ticket to request",
				deDE: "Die ID des Support Tickets",
				esES: "La identificación del ticket de soporte"
			},
			params: {
				required: true,
			},
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
		{ type: "field", key: "ticketId" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00363d"
	},
	dependencies: {
		children: [
			"onFoundTicket",
			"onNotFoundTicket"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IGetTicketParams) => {
		const { api } = cognigy;
		const { ticketId, connection, storeLocation, contextKey, inputKey } = config;
		const { username, password, subdomain } = connection;

		try {

			const response = await axios({
				method: "get",
				url: `https://${subdomain}.zendesk.com/api/v2/tickets/${ticketId}`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				auth: {
					username,
					password
				}
			});

			const onSuccessChild = childConfigs.find(child => child.type === "onFoundTicket");
			api.setNextNode(onSuccessChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data.ticket, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data.ticket);
			}
		} catch (error) {

			const onErrorChild = childConfigs.find(child => child.type === "onNotFoundTicket");
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

export const onFoundTicket = createNodeDescriptor({
	type: "onFoundTicket",
	parentType: "getTicket",
	defaultLabel: {
		default: "On Found",
		deDE: "Artikel gefunden",
		esES: "Encontre"
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

export const onNotFoundTicket = createNodeDescriptor({
	type: "onNotFoundTicket",
	parentType: "getTicket",
	defaultLabel: {
		default: "On Not Found",
		deDE: "Keine Artikel gefunden",
		esES: "Nada Encontrado"
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

