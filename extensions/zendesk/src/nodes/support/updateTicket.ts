import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IUpdateTicketParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			subdomain: string;
		};
		ticketId: number;
		ticket: any;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const updateTicketNode = createNodeDescriptor({
	type: "updateTicket",
	defaultLabel: "Update Ticket",
	summary: "Updates a given ticket in zendesk",
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
			key: "ticketId",
			label: "Ticket ID",
			type: "cognigyText",
			description: "The ID of the ticket to request.",
			params: {
				required: true,
			},
		},
		{
			key: "ticket",
			label: "Ticket Data",
			type: "json",
			description: "The JSON of the ticket to update.",
			params: {
				required: true,
			},
			defaultValue: `{
	"ticket": {
		"comment": {
			"body": "Thanks for choosing Acme Jet Motors.",
				"public": true
		},
		"status": "solved"
	}
}
			`
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
			defaultValue: "zendesk.updated",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "zendesk.updated",
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
		{ type: "field", key: "ticketId" },
		{ type: "field", key: "ticket" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00363d"
	},
	function: async ({ cognigy, config }: IUpdateTicketParams) => {
		const { api } = cognigy;
		const { ticketId, ticket, connection, storeLocation, contextKey, inputKey } = config;
		const { username, password, subdomain } = connection;

		try {

			const response = await axios({
				method: "put",
				url: `https://${subdomain}.zendesk.com/api/v2/tickets/${ticketId}`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				data: ticket,
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