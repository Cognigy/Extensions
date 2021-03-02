import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const request = require('request');
const https = require('https');


export interface IBingWebSearchParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		query: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const bingWebSearchNode = createNodeDescriptor({
	type: "bingWebSearch",
	defaultLabel: "Search on Bing",
	fields: [
		{
			key: "connection",
			label: "Bing Search API Key",
			type: "connection",
			params: {
				connectionType: "bingsearch",
				required: true
			}
		},
		{
			key: "query",
			label: "Search Query",
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
		{ type: "field", key: "query" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#007fff"
	},
	function: async ({ cognigy, config }: IBingWebSearchParams) => {
		const { api } = cognigy;
		const { connection, query, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		return new Promise((resolve, reject) => {
			const accessKey = key;

			https.get({
				hostname: 'api.cognitive.microsoft.com',
				path: `/bing/v7.0/search?q=${encodeURIComponent(query)}`,
				headers: { 'Ocp-Apim-Subscription-Key': accessKey },
			}, res => {
				let body = '';
				res.on('data', part => body += part);
				res.on('end', () => {
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
				res.on('error', err => {
					if (storeLocation === "context") {
						api.addToContext(contextKey, { "error": err.message }, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, { "error": err.message });
					}
				});
			});
		});
	}
});