import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const request = require('request');
const https = require('https');


export interface IBingNewsSearchParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		term: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const bingNewsSearchNode = createNodeDescriptor({
	type: "bingNewsSearch",
	defaultLabel: "Search for Bing News",
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
			key: "term",
			label: "News Topic",
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
		{ type: "field", key: "term" },
		{ type: "section", key: "storageOption" }
	],
	appearance: {
		color: "#007fff"
	},
	function: async ({ cognigy, config }: IBingNewsSearchParams) => {
		const { api } = cognigy;
		const { connection, term, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		return new Promise((resolve, reject) => {
			const accessKey = key;

			https.get({
				hostname: 'api.cognitive.microsoft.com',
				path: `/bing/v7.0/news/search?q=${encodeURIComponent(term)}`,
				headers: { 'Ocp-Apim-Subscription-Key': accessKey },
			}, res => {
				let body = '';
				res.on('data', (d) => {
					body += d;
				});
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
			});
		});
	}
});