import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios, { AxiosResponse } from 'axios';

export interface IiCaltoJSONviaURLParams extends INodeFunctionBaseParams {
	config: {
		iCalURL: string;
        storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const iCaltoJSONviaURLNode = createNodeDescriptor({
	type: "iCaltoJSONviaURL",
	defaultLabel: "Convert iCal to JSON via URL",
	fields: [
		{
			key: "iCalURL",
			label: "URL of iCal file",
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
		{ type: "field", key: "iCalURL" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#fa4514"
	},
	function: async ({ cognigy, config }: IiCaltoJSONviaURLParams) => {
        const { api } = cognigy;
		const { iCalURL, storeLocation, inputKey, contextKey } = config;
		let ical2json = require('ical2json');
		let endpoint = iCalURL;

		try {
			const result: AxiosResponse = await axios.get(endpoint);
			if (storeLocation === 'context') {
				api.addToContext(contextKey, ical2json.convert(result.data), 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, ical2json.convert(result.data));
			}
		} catch (error) {
			if (storeLocation === 'context') {
				api.addToContext(contextKey, { error: error.message }, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});