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
	defaultLabel: "Get Ticket",
	summary: "Retrieves the information about a given ticket from zendesk",
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
	defaultLabel: "On Found",
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
	defaultLabel: "On Not Found",
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

