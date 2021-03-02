import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface IExtractKeyphrasesParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
			region: string;
		};
		text: string;
		language: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const extractKeyphrasesNode = createNodeDescriptor({
	type: "extractKeyphrases",
	defaultLabel: "Extract Keyphrases",
	fields: [
		{
			key: "connection",
			label: "Text Analytics API Key and Region",
			type: "connection",
			params: {
				connectionType: "textanalytics",
				required: true
			}
		},
		{
			key: "text",
			label: "Text",
			type: "cognigyText",
			description: "The text that should be used for extracting keyphrases",
			defaultValue: "{{input.text}}",
			params: {
				required: true
			}
		},
		{
			key: "language",
			type: "select",
			label: "Language",
			params: {
				options: [
					{
						label: "English",
						value: "en"
					},
					{
						label: "Spanish",
						value: "es"
					},
					{
						label: "German",
						value: "de"
					}
				],
				required: true
			},
			defaultValue: "en"
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
			defaultValue: "microsoft.azure.keyphrases",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "microsoft.azure.keyphrases",
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
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "text" },
		{ type: "field", key: "language" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#007fff"
	},
	function: async ({ cognigy, config }: IExtractKeyphrasesParams) => {
		const { api } = cognigy;
		const { connection, text, language, storeLocation, inputKey, contextKey } = config;
		const { key, region } = connection;

		try {
			const response = await axios({
				method: "POST",
				url: `https://${region}.api.cognitive.microsoft.com/text/analytics/v3.0/keyPhrases`,
				headers: {
					'Ocp-Apim-Subscription-Key': key,
					'Content-Type': 'application/json'
				},
				data: {
					"documents": [
						{
							"id": "1",
							text,
							language
						}
					]
				}
			});

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data);
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