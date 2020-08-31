import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGeocodeGeocoderParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			appId: string;
			apiKey: string;
		};
		query: string;
		limit: number;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const geocodeGeocoderNode = createNodeDescriptor({
	type: "geocodeGeocoder",
	defaultLabel: "Get Location",
	preview: {
		key: "query",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "Here Connection",
			type: "connection",
			params: {
				connectionType: "here",
				required: true
			}
		},
		{
			key: "query",
			label: "Search Query",
			description: `
			Enter a free-text query

			Examples:

			125, Berliner, berlin
			Beacon, Boston, Hospital
			Schnurrbart German Pub and Restaurant, Hong Kong
`,
			type: "cognigyText",
			params: {
				required: true,
			},
		},
		{
			key: "limit",
			label: "Results Limit",
			defaultValue: 20,
			description: `
			Default: 20
			Maximum number of results to be returned.
`,
			type: "number",
			params: {
				required: true,
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
			defaultValue: "here.location",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "here.location",
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
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"limit"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "query" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#6BDEBD"
	},
	function: async ({ cognigy, config }: IGeocodeGeocoderParams) => {
		const { api } = cognigy;
		const { query, limit, connection, storeLocation, contextKey, inputKey } = config;
		const { apiKey, appId } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `https://geocode.search.hereapi.com/v1/geocode?app_id=${appId}&apiKey=${apiKey}&q=${query}&limit=${limit}`,
				headers: {
					'Content-Type': 'application/json'
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