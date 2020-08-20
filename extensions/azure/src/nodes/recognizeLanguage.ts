import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const request = require('request');
const https = require('https');


export interface IRecognizeLanguageParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
			region: string;
		};
		text: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const recognizeLanguageNode = createNodeDescriptor({
	type: "recognizeLanguage",
	defaultLabel: "Recognize Language",
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
			defaultValue: "{{input.text}}",
			params: {
				required: true
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
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#007fff"
	},
	function: async ({ cognigy, config }: IRecognizeLanguageParams) => {
		const { api } = cognigy;
		const { connection, text, storeLocation, inputKey, contextKey } = config;
		const { key, region } = connection;

		return new Promise((resolve, reject) => {
			const accessKey = key;

			const uri = `${region}.api.cognitive.microsoft.com`;
			const path = '/text/analytics/v2.0/languages';

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

			const getLanguage = (documents) => {
				const body = JSON.stringify(documents);

				const requestParams = {
					method: 'POST',
					hostname: uri,
					path: path,
					headers: {
						'Ocp-Apim-Subscription-Key': accessKey,
					}
				};

				const req = https.request(requestParams, responseHandler);
				req.write(body);
				req.end();
			};

			const documents = {
				'documents': [
					{ 'id': '1', 'text': text }
				]
			};

			getLanguage(documents);

		});
	}
});