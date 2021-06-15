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
	defaultLabel: "Create Ticket",
	summary: "Creates a new support ticket",
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
			key: "subject",
			label: "Subject",
			type: "cognigyText",
			description: "The subject of the new support ticket",
			params: {
				required: true
			}
		},
		{
			key: "description",
			label: "Description",
			type: "cognigyText",
			description: "The description of the new support ticket",
			params: {
				required: true
			}
		},
		{
			key: "priority",
			label: "Priority",
			type: "select",
			description: "The priority of the new support ticket",
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