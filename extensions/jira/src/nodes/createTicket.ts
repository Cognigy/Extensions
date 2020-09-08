import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const JiraClient = require('jira-connector');

export interface ICreateTicketParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			domain: string;
			email: string;
			key: string;
		};
		fields: any;
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
			label: "Jira Connection",
			type: "connection",
			params: {
				connectionType: "jira",
				required: true
			}
		},
		{
			key: "fields",
			label: "Fields",
			type: "json",
			description: "Creates a new ticket in JIRA. Please read this https://developer.atlassian.com/server/jira/platform/jira-rest-api-example-create-issue-7897248/",
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
			defaultValue: "jira.ticket",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "jira.ticket",
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
		{ type: "field", key: "fields" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#0052CC"
	},
	function: async ({ cognigy, config }: ICreateTicketParams) => {
		const { api } = cognigy;
		const { fields, connection, storeLocation, contextKey, inputKey } = config;
		const { domain, email, key } = connection;

		const jira = new JiraClient({
			host: domain,
			basic_auth: {
				email,
				api_token: key
			}
		});

		try {
			const response = await jira.issue.createIssue({
				fields
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response);
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}
	}
});