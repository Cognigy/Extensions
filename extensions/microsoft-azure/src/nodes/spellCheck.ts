import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';


export interface ISpellCheckParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		text: string;
		language: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const spellCheckNode = createNodeDescriptor({
	type: "spellCheck",
	defaultLabel: "Spellcheck",
	fields: [
		{
			key: "connection",
			label: "Cognitive Services API Key",
			type: "connection",
			params: {
				connectionType: "spellcheck",
				required: true
			}
		},
		{
			key: "text",
			label: "Text",
			type: "cognigyText",
			description: "The text that should be checked",
			defaultValue: "{{input.text}}",
			params: {
				required: true
			}
		},
		{
			key: "language",
			type: "select",
			label: "Language",
			defaultValue: "en-US",
			params: {
				options: [
					{
						label: "Spanish",
						value: "es-ES"
					},
					{
						label: "Catalan",
						value: "es-CL"
					},
					{
						label: "Russian",
						value: "ru"
					},
					{
						label: "Portuguese",
						value: "pt-PT"
					},
					{
						label: "Brazilian Portuguese",
						value: "pt-BR"
					},
					{
						label: "Polish",
						value: "pl"
					},
					{
						label: "Norwegian",
						value: "no"
					},
					{
						label: "Korean",
						value: "ko"
					},
					{
						label: "Japanese",
						value: "ja"
					},
					{
						label: "Italian",
						value: "it"
					},
					{
						label: "Swiss German",
						value: "de-CH"
					},
					{
						label: "German",
						value: "de-DE"
					},
					{
						label: "Austrian German",
						value: "de-AT"
					},
					{
						label: "Swiss French",
						value: "fr-CH"
					},
					{
						label: "French",
						value: "fr-FR"
					},
					{
						label: "Belgium French",
						value: "fr-BE"
					},
					{
						label: "Finnish",
						value: "fi"
					},
					{
						label: "US English",
						value: "en-US"
					},
					{
						label: "British English",
						value: "en-GB"
					},
					{
						label: "New Zealand English",
						value: "en-NZ"
					},
					{
						label: "Australian English",
						value: "en-AU"
					},
					{
						label: "Dutch",
						value: "nl-NL"
					},
					{
						label: "Arabic",
						value: "ar"
					},
					{
						label: "Danish",
						value: "da"
					},
					{
						label: "Belgium Dutch",
						value: "nl-BE"
					}
				],
				required: true
			},
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
			defaultValue: "microsoft.azure.spellcheck",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "microsoft.azure.spellcheck",
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
	function: async ({ cognigy, config }: ISpellCheckParams) => {
		const { api } = cognigy;
		const { connection, text, language, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		try {
			const response = await axios({
				method: "GET",
				url: `https://api.cognitive.microsoft.com/bing/v7.0/spellcheck?mkt=${language}&mode=proof&text=${text}`,
				headers: {
					'Ocp-Apim-Subscription-Key': key,
					'Content-Type': 'application/x-www-form-urlencoded'
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