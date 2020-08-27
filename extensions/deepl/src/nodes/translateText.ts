import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ITranslateTextParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		text: string;
		targetLang: string;
		storeLocation: string
		inputKey: string;
		contextKey: string;
	};
}

export const translateTextNode = createNodeDescriptor({
	type: "translateText",
	defaultLabel: "Translate Text",
	fields: [
		{
			key: "connection",
			label: "DeepL Connection",
			type: "connection",
			params: {
				connectionType: "deepl",
				required: true
			}
		},
		{
			key: "text",
			label: "Text",
			type: "cognigyText",
			defaultValue: "{{input.text}}",
			params: {
				required: true
			}
		},
		{
			key: "targetLang",
			label: "Target Language",
			type: "select",
			defaultValue: "EN",
			params: {
				required: true,
				options: [
					{
						label: "English",
						value: "EN"
					},
					{
						label: "German",
						value: "DE"
					},
					{
						label: "French",
						value: "FR"
					},
					{
						label: "Italian",
						value: "IT"
					},
					{
						label: "Japanese",
						value: "JA"
					},
					{
						label: "Spanish",
						value: "ES"
					},
					{
						label: "Dutch",
						value: "NL"
					},
					{
						label: "Polish",
						value: "PL"
					},
					{
						label: "Portuguese",
						value: "PT"
					},
					{
						label: "Russian",
						value: "RU"
					},
					{
						label: "Chinese",
						value: "ZH"
					}
				]
			}
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
			defaultValue: "deepl",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "deepl",
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
		{ type: "field", key: "connection" },
		{ type: "field", key: "text" },
		{ type: "field", key: "targetLang" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#0f2b46"
	},
	function: async ({ cognigy, config }: ITranslateTextParams) => {
		const { api } = cognigy;
		const { connection, text, targetLang, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		try {
			const response = await axios({
				method: 'post',
				url: `https://api.deepl.com/v2/translate?auth_key=${key}&text=${text}&target_lang=${targetLang}`,
				headers: {
					'Accept': '*/*',
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
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});
