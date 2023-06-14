import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

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
			label: "Postcode",
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
		let { inputText, storeLocation, inputKey, contextKey } = config;

		try {

			if (inputText.startsWith("0")) {
				inputText = inputText.substring(1);
			}

			const filename = `postcode-${inputText.substring(0, 2)}000-${inputText.substring(0, 2)}999.json`;
			const streets: Street[] = require(`../assets/streets/${filename}`);

			let streetsInPostcode = [];

			for (let street of streets) {
				if (street.postcode === inputText) {
					streetsInPostcode.push(street.street);
				}
			}

			if (storeLocation === 'context') {
				api.addToContext(contextKey, streetsInPostcode, 'simple');
			} else {
				// @ts-ignore
				api.addToInput(inputKey, streetsInPostcode);
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