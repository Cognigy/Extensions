import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface IDetectLanguageInTextParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		text: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const detectLanguageInTextNode = createNodeDescriptor({
	type: "detectLanguageInText",
	defaultLabel: "Detect Language In Text",
	preview: {
		key: "text",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "API Key",
			type: "connection",
			params: {
				connectionType: "google-cloud-connection",
				required: true
			}
		},
		{
			key: "text",
			label: "Text",
			type: "cognigyText",
			defaultValue: "{{input.text}}",
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
			defaultValue: "detectedLanguage",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "detectedLanguage",
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
		},
		{
			key: "connectionSection",
			label: "Connection",
			defaultCollapsed: false,
			fields: [
				"connection",
			]
		}
	],
	form: [
		{ type: "section", key: "connectionSection" },
		{ type: "field", key: "text" },
		{ type: "section", key: "detectedLanguageOptions" },
		{ type: "section", key: "storage" },

	],
	appearance: {
		color: "#3cba54"
	},
	function: async ({ cognigy, config }: IDetectLanguageInTextParams) => {
		const { api } = cognigy;
		const { text, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		/* google detectedLanguage package */
		const googleTranslate = require('google-translate')(key);

		return new Promise((resolve, reject) => {

			googleTranslate.detectLanguage(text, (err: any, detection: any) => {
				if (err) {
					if (storeLocation === "context") {
						api.addToContext(contextKey, err.message, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, err.message);
					}
				}

				if (storeLocation === "context") {
					api.addToContext(contextKey, detection.language, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, detection.language);
				}
			});
		});
	}
});