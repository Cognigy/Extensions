import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetLocationsByFiltersParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		filters: string;
		apiVersion: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getLocationsByFiltersNode = createNodeDescriptor({
	type: "getLocationsByFilters",
	defaultLabel: "Get Locations By Filters",
	fields: [
		{
			key: "connection",
			label: "API Key",
			type: "connection",
			params: {
				connectionType: "yext",
				required: true
			}
		},
		{
			key: "filters",
			label: "Filters",
			type: "json",
			description: "The filters to use for this search",
			defaultValue: `[
	{
		"city": {
			"contains": [
				"value"
			]
		}
	}
]
`,
			params: {
				required: true
			}
		},
		{
			key: "apiVersion",
			label: "API Version",
			type: "cognigyText",
			description: "The version of the API your organization is using.",
			defaultValue: "20190424",
			params: {
				required: true
			}
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
			defaultValue: "yext.locations",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "yext.locations",
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
				"apiVersion"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "filters" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#02444f"
	},
	function: async ({ cognigy, config }: IGetLocationsByFiltersParams) => {
		const { api } = cognigy;
		const { filters, apiVersion, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `https://api.yext.com/v2/accounts/me/locationsearch`,
				headers: {
					'Content-Type': 'application/json',
					'Allow': 'application/json'
				},
				params: {
					filters: JSON.stringify(filters),
					api_key: key,
					v: apiVersion
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