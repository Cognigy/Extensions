import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();

export interface IDetectLanguageParams extends INodeFunctionBaseParams {
	config: {
		text: string;
		fullResults: boolean;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const detectLanguageNode = createNodeDescriptor({
	type: "detectLanguage",
	defaultLabel: "Detect Language",
	preview: {
		key: "text",
		type: "text"
	},
	fields: [
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
			key: "fullResults",
			label: "Show Full Results",
			type: "toggle",
			defaultValue: false,
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
			key: "fullResultsSection",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"fullResults",
			]
		}
	],
	form: [
		{ type: "field", key: "text" },
		{ type: "section", key: "fullResultsSection" },
		{ type: "section", key: "storage" },

	],
	appearance: {
		color: "#000000"
	},
	function: async ({ cognigy, config }: IDetectLanguageParams) => {
		const { api } = cognigy;
		const { text, fullResults, storeLocation, contextKey, inputKey } = config;

		try {
			const detected = lngDetector.detect(text);

			if (detected.length > 0) {

				const detectedres = {
					"result": lngDetector.detect(text)
				};

				// check if the full result should be returned or not
				if (fullResults) {
					if (storeLocation === "context") {
						api.addToContext(contextKey, detectedres, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, detectedres);
					}
				} else {
					if (storeLocation === "context") {
						api.addToContext(contextKey, detectedres.result[0][0], "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, detectedres.result[0][0]);
					}
				}

			} else {
				if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFCF3\uFE70-\uFEFC]/.test(text)) {
					if (storeLocation === "context") {
						api.addToContext(contextKey, { result: "arabic" }, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, { result: "arabic" });
					}
				} else {
					if (storeLocation === "context") {
						api.addToContext(contextKey, { result: "unkown" }, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, { result: "unkown" });
					}
				}
			}
		} catch (error) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});