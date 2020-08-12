import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetAllWeatherParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		city: string;
		contextStore: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}
export const getAllWeather = createNodeDescriptor({
	type: "getAllWeather",
	defaultLabel: "Get Weather",
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
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#fcb603"
	},

	function: async ({ cognigy, config }: IGetAllWeatherParams) => {
		const { api } = cognigy;
		const { connection, city, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		try {

			const response = await axios({
				method: 'get',
				url: `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(city)}&appid=${key}`
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

