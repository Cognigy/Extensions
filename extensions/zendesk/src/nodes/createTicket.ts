import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const zendesk = require('node-zendesk');

export interface ICreateTicketParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			token: string;
			remoteUri: string;
		};
		ticketID: number;
		ticket: {
			ticket: {
				subject: string;
				description: string;
				comment: {
					body: string;
				},
				priority: string;
				requester_id: number;
			}
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const createTicketNode = createNodeDescriptor({
	type: "createTicket",
	defaultLabel: "Create Ticket",
	fields: [
		{
			key: "connection",
			label: "Zendesk Connection",
			type: "connection",
			params: {
				connectionType: "zendesk",
				required: true
			}
		},
		{
			key: "ticket",
			label: "Ticket",
			type: "json",
			description: "JSON of the ticket to update.",
			params: {
				required: true,
			},
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
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
			label: "Input Key to store Result",
			defaultValue: "zendesk.ticket",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
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
		{ type: "field", key: "ticket" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00363d"
	},
	function: async ({ cognigy, config }: ICreateTicketParams) => {
		const { api } = cognigy;
		const { ticket, connection, storeLocation, contextKey, inputKey } = config;
		const { username, token, remoteUri } = connection;

		const client = zendesk.createClient({
			username,
			token,
			remoteUri
		});

		if (!ticket?.ticket?.requester_id) return Promise.reject("No requester defined for ticket");

		return new Promise((resolve, reject) => {
			client.tickets.create(ticket, (err, statusCode, body, response, res) => {

				if (err) {
					if (storeLocation === "context") {
						api.addToContext(contextKey, { error: err.message }, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, { error: err.message });
					}
				}

				if (storeLocation === "context") {
					api.addToContext(contextKey, res, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, res);
				}

				resolve();
			});
		});
	}
});