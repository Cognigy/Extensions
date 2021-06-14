import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ISearchTicketsParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			token: string;
			remoteUri: string;
		};
		query: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const searchTicketsNode = createNodeDescriptor({
	type: "searchTickets",
	defaultLabel: "Search Tickets",
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
			key: "query",
			label: "Search Query",
			type: "cognigyText",
			defaultValue: "{{input.text}}",
			description: "The search query that should be used in order to find tickets within Zendesk.",
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
			defaultValue: "zendesk.support.tickets",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "zendesk.support.tickets",
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
		{ type: "field", key: "query" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00363d"
	},
	function: async ({ cognigy, config }: ISearchTicketsParams) => {
		const { api } = cognigy;
		const { query, connection, storeLocation, contextKey, inputKey } = config;
		const { username, token, remoteUri } = connection;

		const client = zendesk.createClient({
			username,
			token,
			remoteUri
		});

		try {
			const response = client.search.query(query);

			if (storeLocation === "context") {
				api.addToContext(contextKey, response, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response);
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: err });
			}
		}
	}
});