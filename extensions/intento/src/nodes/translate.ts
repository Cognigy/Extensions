import { createNodeDescriptor } from "@cognigy/extension-tools";
import { IIntentoBody, IIntentoService, ITranslateTextParams } from "../models";
import axios from 'axios';
import { ICognigyNodeFunctionParams } from "@cognigy/extension-tools/build/interfaces/descriptor";
import { userAgent } from "../version";

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
			label: "APIKEY",
			type: "connection",
			params: {
				connectionType: "intento-connection",
				required: true
			}
		},
		{
			key: "text",
			label: "Text to translate",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: true,
			},
		},
		{
			key: "sourceLanguage",
			label: "Source language code",
			type: "cognigyText",
			defaultValue: "",
			params: {
				required: false,
			},
		},
		{
			key: "targetLanguage",
			label: "Target language code",
			type: "cognigyText",
			defaultValue: "en",
			params: {
				required: true,
			},
		},
		{
			key: "routing",
			label: "Intento routing",
			type: "cognigyText",
			defaultValue: "best",
			params: {
				required: false,
			},
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			defaultValue: "context",
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
			defaultValue: "results",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "results",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},
		{
			key: "additionalLogging",
			type: "checkbox",
			label: "Additional Logging",
			defaultValue: false
		},
		{
			key: "cache",
			type: "checkbox",
			label: "Translation Storage",
			defaultValue: false
		},
		{
			key: "cacheInstance",
			label: "Translation Storage Instance",
			type: "cognigyText",
			defaultValue: "{{profile.profileId}}",
			params: {
				required: false,
			},
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
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "text" },
		{ type: "field", key: "sourceLanguage" },
		{ type: "field", key: "targetLanguage" },
		{ type: "field", key: "routing" },
		{ type: "field", key: "additionalLogging" },
		{ type: "field", key: "cache" },
		{ type: "field", key: "cacheInstance" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#2a48e1"
	},
	function: async ({ cognigy, config }: ICognigyNodeFunctionParams) => {
		const { api } = cognigy;
		const { text, sourceLanguage, targetLanguage, connection, storeLocation, contextKey, inputKey, routing, additionalLogging, cache, cacheInstance } = config as ITranslateTextParams["config"];
		const { key } = connection;
		const service: IIntentoService = {};
		const intentoBody: IIntentoBody = {
			"context": {
				"to": targetLanguage,
				"text": text
			},
			service
		};

		if (sourceLanguage) {
			intentoBody.context.from = sourceLanguage;
		}
		if (routing) {
			service.routing = routing;
		}
		if (cache) {
			service.cache = {
				apply: true,
				update: true
			};
			service.storage = {
				path: `Cognigy/${cacheInstance}`
			};
		}

		if (additionalLogging) {
			service.trace = true;
		}

		try {
			const maxRetries = 5;
			const baseDelay = 1000;
			let attempt = 0;
			while (attempt < maxRetries) {
				try {
					const response = await axios({
						method: 'post',
						url: 'https://syncwrapper.inten.to/ai/text/translate',
						headers: {
							'User-Agent': userAgent,
							'Content-Type': 'application/json',
							'apikey': key
						},
						data: intentoBody,
					});

					if (storeLocation === "context" && response.data["results"]) {
						if (response.data["results"].length === 1) {
							api.addToContext(contextKey, response.data["results"][0], "simple");
						} else {
							api.addToContext(contextKey, response.data["results"], "simple");
						}
						api.addToContext("intento_operation_id", response.data["id"], "simple");
					} else {
						api.addToInput(inputKey, response.data["results"]);
					}
					return; // Exit the function if the request is successful
				} catch (error: any) {
					attempt++;
					if (attempt >= maxRetries) {
						if (storeLocation === "context") {
							api.addToContext(contextKey, error?.message, "simple");
						} else {
							api.addToInput(inputKey, error?.message);
						}
						return; // Exit the function if max retries are reached
					}
					const delay = baseDelay * Math.pow(2, attempt);
					await new Promise(resolve => setTimeout(resolve, delay));
				}
			}
		} catch (error: any) {
			if (storeLocation === "context") {
				api.addToContext(contextKey, error?.message, "simple");
			} else {
				api.addToInput(inputKey, error?.message);
			}
		}
	}
});
