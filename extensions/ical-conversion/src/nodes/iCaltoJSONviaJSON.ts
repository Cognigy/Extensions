import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface IiCaltoJSONviaJSONParams extends INodeFunctionBaseParams {
	config: {
		iCalJSON: string;
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const iCaltoJSONviaJSONNode = createNodeDescriptor({
	type: "iCaltoJSONviaJSON",
	defaultLabel: "Convert iCal to JSON via JSON",
	fields: [
		{
			key: "iCalJSON",
			label: "Location of JSON",
			description: "Location of JSON in input or context, for example {{context.httprequest.result}}",
			type: "cognigyText",
			params: {
				required: true
			}
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
		{ type: "field", key: "iCalJSON" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IiCaltoJSONviaJSONParams) => {
        const { api } = cognigy;
		const { iCalJSON, storeLocation, inputKey, contextKey } = config;
		let ical2json = require('ical2json');
		let output = ical2json.convert(iCalJSON);

		if (storeLocation === 'context') {
			api.addToContext(contextKey, output, 'simple');
		} else {
			// @ts-ignore
			api.addToInput(inputKey, output);
		}
	}
});