import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IReplyToTicketParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
			subdomain: string;
		};
		ticketId: number;
        message: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const replyToTicketNode = createNodeDescriptor({
	type: "replyToticket",
	defaultLabel: {
		default: "Reply to Ticket",
		deDE: "Auf Ticket antworten",
        esES: "Responder al ticket"
	},
	summary: {
		default: "Responds to the user on a ticket",
		deDE: "Antwortet der Nutzerin auf ein Ticket",
		esES: "Responde al usuario en un ticket"
	},
	fields: [
		{
			key: "connection",
			label: {
				default: "Freshdesk Connection",
				deDE: "Freshdesk Verbindung",
				esES: "Freshdesk Conexión"
			},
			type: "connection",
			params: {
				connectionType: "freshdesk-apikey",
				required: true
			}
		},
        {
			key: "ticketId",
			label: "Ticket ID",
			type: "cognigyText",
            description: {
                default: "The ID of the support ticket",
                deDE: "Die ID des Support Tickets",
                esES: "La identificación del ticket de soporte"
            },
			params: {
				required: true,
			},
		},
        {
			key: "message",
            label: {
				default: "Message",
				deDE: "Nachricht",
				esES: "Mensaje"
			},
			type: "cognigyText",
            defaultValue: "<body><p>Hello Anna</p></body>",
            description: {
                default: "The HTML message that answers the user",
                deDE: "Die HTML Nachricht, die der Nutzerin antwortet",
                esES: "El mensaje HTML que responde al usuario"
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
				deDE: "Input Key zum Speichern des Ergebnisses",
				esES: "Input Key para almacenar el resultado"
			},
			defaultValue: "freshdesk",
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
				deDE: "Context Key zum Speichern des Ergebnisses",
				esES: "Context Key para almacenar el resultado"
			},
			defaultValue: "freshdesk",
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
		{ type: "field", key: "message" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#20a849"
	},
	function: async ({ cognigy, config }: IReplyToTicketParams) => {
		const { api } = cognigy;
		const { connection, ticketId, message, storeLocation, contextKey, inputKey } = config;
		const { key, subdomain } = connection;

		try {

			const response = await axios({
				method: "post",
				url: `https://${subdomain}.freshdesk.com/api/v2/tickets/${ticketId}/reply`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				data: {
					body: message
				},
				auth: {
					username: key,
					password: "X"
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