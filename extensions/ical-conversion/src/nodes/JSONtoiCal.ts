import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IJSONtoiCalParams extends INodeFunctionBaseParams {
	config: {
		dateStart: string;
		dateEnd: string;
		categories: string;
		location: string;
		summary: string;
		description: string;
		sourceJSON: string;
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const iJSONtoiCalNode = createNodeDescriptor({
	type: "JSONtoiCal",
	defaultLabel: "Convert JSON Information to iCal",
	fields: [
		{
			key: "dateStart",
			label: "Event Start Date/Time",
			type: "cognigyText",
			params: {
				required: true
			}
        },
		{
			key: "dateEnd",
			label: "Event End Date/Time",
			type: "cognigyText",
			params: {
				required: true
			}
        },
		{
			key: "categories",
			label: "Event Categories",
			type: "cognigyText"
        },
		{
			key: "location",
			label: "Event Location",
			type: "cognigyText"
        },
		{
			key: "summary",
			label: "Event Summary/Title",
			type: "cognigyText"
        },
		{
			key: "description",
			label: "Event Description",
			type: "cognigyText"
        },
		{
			key: "storeLocation",
			type: "select",
			label: "Where to Store the Result",
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
			label: "Input Key to Store Result",
			defaultValue: "convertediCal",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to Store Result",
			defaultValue: "convertediCal",
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
		{ type: "field", key: "sourceJSON" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IJSONtoiCalParams) => {
        const { api } = cognigy;
		const { sourceJSON, storeLocation, inputKey, contextKey } = config;
		let ical2json = require('ical2json');
		let output = ical2json.revert(sourceJSON);
		sourceJSON
		if (storeLocation === 'context') {
			api.addToContext(contextKey, output, 'simple');
		} else {
			// @ts-ignore
			api.addToInput(inputKey, output);
		}
	}
});