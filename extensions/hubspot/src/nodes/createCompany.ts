import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { Client } from '@hubspot/api-client';

const EXTENSION_TIMEOUT = 10000;

// Define common company properties interface
interface ICompanyProperties {
	name?: string;
	domain?: string;
	industry?: string;
	description?: string;
	phone?: string;
	address?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
	website?: string;
	[key: string]: any; // Allow custom properties
}

export interface ICreateCompanyParams extends INodeFunctionBaseParams {
	config: {
		data: any;
		connection: {
			accessToken: string;
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
}`
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
	function: (async ({ cognigy, config }: ICreateCompanyParams) => {
		const { api } = cognigy;
		const {
			storeLocation,
			contextKey,
			inputKey,
			data,
			connection
		} = config;
		const { accessToken } = connection;

		try {
			if (storeLocation === "context") api.deleteContext(contextKey);

			const result = await Promise.race([
				createCompany(data, accessToken),
				new Promise((resolve, reject) => setTimeout(() => resolve({ "error": "timeout" }), EXTENSION_TIMEOUT))
			]);

			if (storeLocation === "context") api.addToContext(contextKey, result, "simple");
			else api.addToInput(inputKey, result);

		} catch (err: unknown) {
			const resultObject = {
				result: null,
				error: err instanceof Error ? err.message : String(err)
			};
			if (storeLocation === "context") {
				api.addToContext(contextKey, resultObject, "simple");
			} else {
				api.addToInput(inputKey, resultObject);
			}
		}
	}) as any
});

/**
 * Creates a company in Hubspot
 * @param data The create company data
 * @param accessToken The accessToken to use
 */
async function createCompany(data: any, accessToken: string): Promise<any> {
	if (!data) return Promise.reject("No company create data defined.");

	try {
		const client = new Client({ accessToken });

		// Convert the properties array to the format expected by the new API
		const properties: Record<string, any> = {};
		if (data.properties && Array.isArray(data.properties)) {
			data.properties.forEach((prop: { name: string; value: any }) => {
				if (prop.name && prop.value !== undefined) {
					properties[prop.name] = prop.value;
				}
			});
		}

		const response = await client.crm.companies.basicApi.create({
			properties: properties,
			associations: []
		});

		return response;
	} catch (err: unknown) {
		throw new Error(err instanceof Error ? err.message : String(err));
	}
}
