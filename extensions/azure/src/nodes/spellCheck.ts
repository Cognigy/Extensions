import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const request = require('request');
const https = require('https');


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
						label: "es-MX",
						value: "es-MX"
					},
					{
						label: "Catalan",
						value: "es-CL"
					},
					{
						label: "es-AR",
						value: "es-AR"
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
						label: "pt-BR",
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
						label: "German",
						value: "de-CH"
					},
					{
						label: "de-DE",
						value: "de-DE"
					},
					{
						label: "de-AT",
						value: "de-AT"
					},
					{
						label: "fr-CH",
						value: "fr-CH"
					},
					{
						label: "French",
						value: "fr-FR"
					},
					{
						label: "fr-CA",
						value: "fr-CA"
					},
					{
						label: "fr-BE",
						value: "fr-BE"
					},
					{
						label: "Finnish",
						value: "fi"
					},
					{
						label: "English",
						value: "en-US"
					},
					{
						label: "British English",
						value: "en-GB"
					},
					{
						label: "en-ZA",
						value: "en-ZA"
					},
					{
						label: "en-PH",
						value: "en-PH"
					},
					{
						label: "en-NZ",
						value: "en-NZ"
					},
					{
						label: "en-MY",
						value: "en-MY"
					},
					{
						label: "en-ID",
						value: "en-ID"
					},
					{
						label: "en-IN",
						value: "en-IN"
					},
					{
						label: "en-CA",
						value: "en-CA"
					},
					{
						label: "en-AU",
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
						label: "zh-CN",
						value: "zh-CN"
					},
					{
						label: "zh-HK",
						value: "zh-HK"
					},
					{
						label: "zh-TW",
						value: "zh-TW"
					},
					{
						label: "Danish",
						value: "da"
					},
					{
						label: "nl-BE",
						value: "nl-BE"
					}
				],
				required: false
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
			defaultValue: "httprequest",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "httprequest",
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

		return new Promise((resolve, reject) => {

			const host = 'api.cognitive.microsoft.com';
			const path = '/bing/v7.0/spellcheck';
			const queryString = `?mkt=${language}&mode=proof`;

			const requestParams = {
				method: 'POST',
				hostname: host,
				path: path + queryString,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': text.length + 5,
					'Ocp-Apim-Subscription-Key': key,
				}
			};

			const responseHandler = (response) => {
				let body = '';
				response.on('data', (d) => {
					body += d;
				});
				response.on('end', () => {
					try {
						if (storeLocation === "context") {
							api.addToContext(contextKey, JSON.parse(body), "simple");
						} else {
							// @ts-ignore
							api.addToInput(inputKey, JSON.parse(body));
						}
					} catch (e) {
						if (storeLocation === "context") {
							api.addToContext(contextKey, { "error": e.message }, "simple");
						} else {
							// @ts-ignore
							api.addToInput(inputKey, { "error": e.message });
						}
					}
				});
				response.on('error', (err) => {


					if (storeLocation === "context") {
						api.addToContext(contextKey, { "error": err.message }, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, { "error": err.message });
					}
				});
			};

			const req = https.request(requestParams, responseHandler);
			req.write("text=" + text);
			req.end();
		});
	}
});