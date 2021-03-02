import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IExtractTicketFromTextParams extends INodeFunctionBaseParams {
	config: {
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const extractTicketFromTextNode = createNodeDescriptor({
	type: "extractTicketFromText",
	defaultLabel: "Extract Ticket from Text",
	fields: [
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
			defaultValue: "jira.found",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "jira.found",
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
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#0052CC"
	},
	function: async ({ cognigy, config }: IExtractTicketFromTextParams) => {
		const { api, input } = cognigy;
		const { storeLocation, contextKey, inputKey } = config;

		try {

			let match = await input.text.match(/[a-zA-Z]+-\d+/g);

			if (storeLocation === "context") {
				api.addToContext(contextKey, match, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, match);
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