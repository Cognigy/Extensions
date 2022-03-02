import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Hubspot from 'hubspot';

const EXTENSION_TIMEOUT = 10000;

export interface IUpdateCompanyParams extends INodeFunctionBaseParams {
	config: {
		data: any;
		companyId: number;
		connection: {
			apikey: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const updateCompanyNode = createNodeDescriptor({
	type: "updateCompany",
	defaultLabel: "Update Company",
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
			key: "companyId",
			label: "Hubspot Company ID",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "data",
			label: "Update Company Data",
			type: "json",
			defaultValue: `{
	"properties": [
	  {
		"name": "name",
		"value": "New Name"
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
		{ type: "field", key: "companyId" },
		{ type: "field", key: "data" },
		{ type: "section", key: "storage" },
	],
	preview: {
		type: "text",
		key: "companyId"
	},
	appearance: {
		color: "#fa7820"
	},

	function: async ({ cognigy, config }: IUpdateCompanyParams) => {
		const { api } = cognigy;
		const {
			storeLocation,
			contextKey,
			inputKey,
			companyId,
			data,
			connection
		} = config;
		const { apikey } = connection;

		try {
			if (storeLocation === "context") api.deleteContext(contextKey);

			const result = await Promise.race([
				updateCompany(companyId, data, apikey),
				new Promise((resolve, reject) => setTimeout(() => resolve({ "error": "timeout" }), EXTENSION_TIMEOUT))
			]);

			if (storeLocation === "context") api.addToContext(contextKey, true, "simple");
			// @ts-ignore
			else api.addToInput(inputKey, true);

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
 * Updates a company in Hubspot
 * @param companyId the company id
 * @param data The update contact data
 * @param apiKey The apiKey to use
 */
async function updateCompany(companyId: number, data: any, apiKey: string): Promise<any> {
	if (!companyId) return Promise.reject("No company id defined.");
	if (!data) return Promise.reject("No contact update data defined.");

	try {
		const hubspot = new Hubspot({ apiKey });
		// @ts-ignore
		if (hubspot.qs && typeof hubspot.qs === 'object') hubspot.qs.propertyMode = 'value_only';

		try {
			const response = await hubspot.companies.update(companyId, data);

			return response;
		} catch (err) {
			throw new Error(err.message);
		}
	} catch (err) {
		throw new Error(err.message);
	}
}
