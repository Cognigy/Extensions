import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const JiraClient = require('jira-connector');

export interface IGetTicketParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			domain: string;
			email: string;
			key: string;
		};
		issueKey: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getTicketNode = createNodeDescriptor({
	type: "getTicket",
	defaultLabel: "Get Ticket",
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
			key: "issueKey",
			label: "Ticket Number",
			type: "cognigyText",
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
		{ type: "field", key: "issueKey" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#0052CC"
	},
	function: async ({ cognigy, config }: IGetTicketParams) => {
		const { api } = cognigy;
		const { issueKey, connection, storeLocation, contextKey, inputKey } = config;
		const { domain, email, key } = connection;

		const jira = new JiraClient({
			host: domain,
			basic_auth: {
				email,
				api_token: key
			}
		});

		try {
			const response = await jira.issue.getIssue({ issueKey });

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