import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IFindTicketInTextParams extends INodeFunctionBaseParams {
	config: {
		ticketType: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const findTicketInTextNode = createNodeDescriptor({
	type: "findTicketInText",
	defaultLabel: "Find Ticket in Text",
	fields: [
		{
			key: "ticketType",
			type: "select",
			label: "The type of ticket to look for.",
			params: {
				options: [
					{
						label: "Incident (INC)",
						value: "incident"
					},
					{
						label: "Catalog Request (REQ)",
						value: "catalogRequest"
					},
					{
						label: "Catalog Task (SCTASK)",
						value: "catalogTask"
					}
				],
				required: true
			},
			defaultValue: "incident"
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
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
			defaultValue: "input"
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "snow.ticket",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "snow.ticket",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storageOption",
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
		{ type: "field", key: "ticketType" },
		{ type: "section", key: "storageOption" }
	],
	tokens: [
		{
			label: "Extracted Ticket",
			script: "ci.snow.ticket",
			type: "answer"
		}
	],
	appearance: {
		color: "#80b6a1"
	},
	function: async ({ cognigy, config }: IFindTicketInTextParams) => {
		const { api } = cognigy;
		const { ticketType, storeLocation, inputKey, contextKey } = config;

		let pattern: any;

		if (ticketType === "incident") {
			pattern = /INC\d+/gim;
		} else if (ticketType === "catalogRequest") {
			pattern = /REQ\d+/gim;
		} else {
			pattern = /SCTASK\d+/gim;
		}

		let ticket = cognigy.input.text.match(pattern);

		if (storeLocation === "context") {
			if (ticket) {
				api.addToContext(contextKey, ticket[0], "simple");
			}
		} else {
			if (ticket) {
				// @ts-ignore
				api.addToInput(inputKey, ticket[0]);
			}
		}
	}
});