import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";


export interface ITranslateTextParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		language: string;
		text: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const translateTextNode = createNodeDescriptor({
	type: "translateText",
	defaultLabel: "Translate Text",
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
			key: "language",
			label: "Language",
			type: "select",
			defaultValue: "en",
			params: {
				required: true,
				options: [{ label: 'af', value: 'af' },
				{ label: 'sq', value: 'sq' },
				{ label: 'am', value: 'am' },
				{ label: 'ar', value: 'ar' },
				{ label: 'hy', value: 'hy' },
				{ label: 'az', value: 'az' },
				{ label: 'eu', value: 'eu' },
				{ label: 'be', value: 'be' },
				{ label: 'bn', value: 'bn' },
				{ label: 'bs', value: 'bs' },
				{ label: 'bg', value: 'bg' },
				{ label: 'ca', value: 'ca' },
				{ label: 'ceb', value: 'ceb' },
				{ label: 'zh-CN', value: 'zh-CN' },
				{ label: 'zh-TW', value: 'zh-TW' },
				{ label: 'co', value: 'co' },
				{ label: 'hr', value: 'hr' },
				{ label: 'cs', value: 'cs' },
				{ label: 'da', value: 'da' },
				{ label: 'nl', value: 'nl' },
				{ label: 'en', value: 'en' },
				{ label: 'eo', value: 'eo' },
				{ label: 'et', value: 'et' },
				{ label: 'fi', value: 'fi' },
				{ label: 'fr', value: 'fr' },
				{ label: 'fy', value: 'fy' },
				{ label: 'gl', value: 'gl' },
				{ label: 'ka', value: 'ka' },
				{ label: 'de', value: 'de' },
				{ label: 'el', value: 'el' },
				{ label: 'gu', value: 'gu' },
				{ label: 'ht', value: 'ht' },
				{ label: 'ha', value: 'ha' },
				{ label: 'haw', value: 'haw' },
				{ label: 'hi', value: 'hi' },
				{ label: 'hmn', value: 'hmn' },
				{ label: 'hu', value: 'hu' },
				{ label: 'is', value: 'is' },
				{ label: 'ig', value: 'ig' },
				{ label: 'id', value: 'id' },
				{ label: 'ga', value: 'ga' },
				{ label: 'it', value: 'it' },
				{ label: 'ja', value: 'ja' },
				{ label: 'jw', value: 'jw' },
				{ label: 'kn', value: 'kn' },
				{ label: 'kk', value: 'kk' },
				{ label: 'km', value: 'km' },
				{ label: 'ko', value: 'ko' },
				{ label: 'ku', value: 'ku' },
				{ label: 'ky', value: 'ky' },
				{ label: 'lo', value: 'lo' },
				{ label: 'la', value: 'la' },
				{ label: 'lv', value: 'lv' },
				{ label: 'lt', value: 'lt' },
				{ label: 'lb', value: 'lb' },
				{ label: 'mk', value: 'mk' },
				{ label: 'mg', value: 'mg' },
				{ label: 'ms', value: 'ms' },
				{ label: 'ml', value: 'ml' },
				{ label: 'mt', value: 'mt' },
				{ label: 'mi', value: 'mi' },
				{ label: 'mr', value: 'mr' },
				{ label: 'mn', value: 'mn' },
				{ label: 'my', value: 'my' },
				{ label: 'ne', value: 'ne' },
				{ label: 'no', value: 'no' },
				{ label: 'ny', value: 'ny' },
				{ label: 'ps', value: 'ps' },
				{ label: 'fa', value: 'fa' },
				{ label: 'pl', value: 'pl' },
				{ label: 'pt', value: 'pt' },
				{ label: 'pa', value: 'pa' },
				{ label: 'ro', value: 'ro' },
				{ label: 'ru', value: 'ru' },
				{ label: 'sm', value: 'sm' },
				{ label: 'gd', value: 'gd' },
				{ label: 'sr', value: 'sr' },
				{ label: 'st', value: 'st' },
				{ label: 'sn', value: 'sn' },
				{ label: 'sd', value: 'sd' },
				{ label: 'si', value: 'si' },
				{ label: 'sk', value: 'sk' },
				{ label: 'sl', value: 'sl' },
				{ label: 'so', value: 'so' },
				{ label: 'es', value: 'es' },
				{ label: 'su', value: 'su' },
				{ label: 'sq', value: 'sq' },
				{ label: 'sv', value: 'sv' },
				{ label: 'tl', value: 'tl' },
				{ label: 'tg', value: 'tg' },
				{ label: 'ta', value: 'ta' },
				{ label: 'te', value: 'te' },
				{ label: 'th', value: 'th' },
				{ label: 'tr', value: 'tr' },
				{ label: 'uk', value: 'uk' },
				{ label: 'ur', value: 'ur' },
				{ label: 'uz', value: 'uz' },
				{ label: 'vi', value: 'vi' },
				{ label: 'cy', value: 'cy' },
				{ label: 'xh', value: 'xh' }
				]
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
			defaultValue: "translation",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "translation",
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
		},
	],
	form: [
		{ type: "section", key: "connectionSection" },
		{ type: "field", key: "text" },
		{ type: "field", key: "language" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#3cba54"
	},
	function: async ({ cognigy, config }: ITranslateTextParams) => {
		const { api } = cognigy;
		const { text, language, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		/* google translation package */
		const googleTranslate = require('google-translate')(key);

		return new Promise((resolve, reject) => {

			googleTranslate.translate(text, language, (err: any, translation: any) => {
				if (err) {
					if (storeLocation === "context") {
						api.addToContext(contextKey, err.message, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, err.message);
					}
				}

				if (storeLocation === "context") {
					api.addToContext(contextKey, translation.translatedText, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, translation.translatedText);
				}
			});
		});
	}
});