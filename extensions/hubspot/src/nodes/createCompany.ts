import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Hubspot from 'hubspot';

const EXTENSION_TIMEOUT = 10000;

export interface ICreateCompanyParams extends INodeFunctionBaseParams {
	config: {
		data: any;
		connection: {
			apikey: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const createCompanyNode = createNodeDescriptor({
	type: "createCompany",
	defaultLabel: "Create Company",
	fields: [
		{
			key: "connection",
			label: "The Hubspot connection which should be used.",
			type: "connection",
			params: {
				required: true,
				connectionType: "hubspot"
			}
		},
		{
			key: "data",
			label: "Create Company Data",
			type: "json",
			defaultValue: `{
	"properties": [
		{
			"name": "name",
			"value": "Company X"
		}
	]
}
			`
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
			defaultValue: "hubspot",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "hubspot",
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
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "data" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#fa7820"
	},

	function: async ({ cognigy, config }: ICreateCompanyParams) => {
		const { api } = cognigy;
		const {
			storeLocation,
			contextKey,
			inputKey,
			data,
			connection
		} = config;
		const { apikey } = connection;

		try {
			if (storeLocation === "context") api.deleteContext(contextKey);

			const result = await Promise.race([
				createCompany(data, apikey),
				new Promise((resolve, reject) => setTimeout(() => resolve({ "error": "timeout" }), EXTENSION_TIMEOUT))
			]);

			if (storeLocation === "context") api.addToContext(contextKey, result, "simple");
			// @ts-ignore
			else api.addToInput(inputKey, result);

		} catch (err) {
			const resultObject = {
				result: null,
				error: err.message
			};
			if (storeLocation === "context") {
				api.addToContext(contextKey, resultObject, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, resultObject);
			}
		}
	}
});

/**
 * Creates a contact in Hubspot
 * @param data The create company data
 * @param apiKey The apiKey to use
 */
async function createCompany(data: any, apiKey: string): Promise<any> {
	if (!data) return Promise.reject("No company create data defined.");

	try {
		const hubspot = new Hubspot({ apiKey });
		// @ts-ignore
		if (hubspot.qs && typeof hubspot.qs === 'object') hubspot.qs.propertyMode = 'value_only';

		try {
			const response = await hubspot.companies.create(data);

			return response;
		} catch (err) {
			throw new Error(err.message);
		}
	} catch (err) {
		throw new Error(err.message);
	}
}
