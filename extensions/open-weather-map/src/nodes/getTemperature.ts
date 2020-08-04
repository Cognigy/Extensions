import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import weather from 'openweather-apis';

export interface IGetTemperatureParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		city: string;
		language: string;
		units: string;
		contextStore: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const getTemperature = createNodeDescriptor({
	type: "getTemperature",
	defaultLabel: "Get Temperature",
	preview: {
		key: "city",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "The api-key which should be used.",
			type: "connection",
			params: {
				connectionType: "api-key",
				required: true
			}
		},
		{
			key: "language",
			label: "Language",
			type: "select",
			defaultValue: "en",
			params: {
				options: [
					{
						label: "English",
						value: "en"
					},
					{
						label: "Russian",
						value: "ru"
					},
					{
						label: "Spanish",
						value: "es"
					},
					{
						label: "English",
						value: "uk"
					},
					{
						label: "German",
						value: "de"
					},
					{
						label: "Portuguese",
						value: "pt"
					},
					{
						label: "Romanian",
						value: "ro"
					},
					{
						label: "Polish",
						value: "pl"
					},
					{
						label: "Finnish",
						value: "fi"
					},
					{
						label: "Dutch",
						value: "nl"
					},
					{
						label: "French",
						value: "fr"
					},
					{
						label: "Bulgarian",
						value: "bg"
					},
					{
						label: "Swedish",
						value: "sv"
					},
					{
						label: "Chinese(T)",
						value: "zh_tw"
					},
					{
						label: "Turkish",
						value: "tr"
					},
					{
						label: "Croatian",
						value: "hr"
					},
					{
						label: "Catalan",
						value: "ca"
					},
					{
						label: "Chinese",
						value: "zh"
					}
				]
			}
		},
		{
			key: "units",
			label: "Units",
			type: "select",
			defaultValue: "metric",
			params: {
				options: [
					{
						label: "Metric",
						value: "metric"
					},
					{
						label: "Internal",
						value: "internal"
					},
					{
						label: "Imperial",
						value: "imperial"
					}
				]
			}
		},
		{
			key: "city",
			label: "city",
			type: "cognigyText",
			defaultValue: "Berlin",
			params: {
				required: true
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
			defaultValue: "weather",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "weather",
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
		}
	],
	form: [
		{ type: "section", key: "connectionSection" },
		{ type: "field", key: "city" },
		{ type: "field", key: "language" },
		{ type: "field", key: "units" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#fcb603"
	},
	function: async ({ cognigy, config }: IGetTemperatureParams) => {
		// Check parameters

		const { api } = cognigy;
		const { connection, city, language, units, contextStore, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		try {
			weather.setLang(language);

			// set city by name
			weather.setCity(city);

			// 'metric'  'internal'  'imperial'
			weather.setUnits(units);

			// check http://openweathermap.org/appid#get for get the APPID
			weather.setAPPID(key);

			// get all the JSON file returned from server (rich of info)

			await new Promise((resolve, reject) => {
				weather.getTemperature((err, temp) => {
					if (err) {
						if (storeLocation === "context") {
							api.addToContext(contextKey, err, "simple");
						} else {
							// @ts-ignore
							api.addToInput(inputKey, err);
						}
					}

					if (storeLocation === "context") {
						api.addToContext(contextKey, temp, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, temp);
					}

					resolve();
				});
			});
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
