import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const streets: Street[] = require("../helpers/streets.json");

interface Street {
	street: string;
	postcode: string;
}

export interface IGetStreetsParams extends INodeFunctionBaseParams {
	config: {
		inputText: string;
		storeLocation: "input" | "context";
		contextKey: string;
		inputKey: string;
	};
}

export const getStreetsNode = createNodeDescriptor({
	type: "getStreets",
	defaultLabel: "Get Streets",
	fields: [
		{
			key: "inputText",
			label: "Input Text",
			type: "cognigyText",
			defaultValue: "{{input.text}}",
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
			defaultValue: "streetList",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "streetList",
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
		{ type: 'field', key: 'inputText' },
		{ type: "section", key: "storage" },
	],
	// function: getStreetsFunction
	function: async ({ cognigy, config }: IGetStreetsParams): Promise<any> => {
		const { api } = cognigy;
		const { inputText, storeLocation, inputKey, contextKey } = config;

		let streetsInPostcode = [];

		for (let street of streets) {
			if (street.postcode === "42119") {
				streetsInPostcode.push(street.street);
			}
		}
		try {
			if (storeLocation === 'context') {
				api.addToContext(contextKey, streetsInPostcode, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, streetsInPostcode);
			}
		} catch (error) {
			if (storeLocation === 'context') {
				api.addToContext(contextKey, { error: "unable to parse value" }, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: "unable to parse value" });
			}
		}

	}
});