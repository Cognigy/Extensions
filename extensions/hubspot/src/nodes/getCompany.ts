import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Hubspot from 'hubspot';

const EXTENSION_TIMEOUT = 10000;

export interface IGetCompanyParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			accessToken: string;
		};
		companyId: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const getCompanyNode = createNodeDescriptor({
	type: "getCompany",
	defaultLabel: "Get Company by Id",
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
            label: "Company ID",
            type: "cognigyText",
            description: "The company ID associated with the deal"
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
		{ type: "field", key: "vid" },
		{ type: "section", key: "storage" }
	],
	preview: {
		type: "text",
		key: "vid"
	},
	appearance: {
		color: "#fa7820"
	},

	function: async ({ cognigy, config }: IGetCompanyParams) => {
		const { api } = cognigy;
		const {
			storeLocation,
			contextKey,
			inputKey,
			connection,
			companyId
		} = config;
		const { accessToken } = connection;

		let id = parseInt(companyId);

		try {
			if (storeLocation === "context") api.deleteContext(contextKey);
			// const properties = ['name', 'country', 'city'];

			const result = await Promise.race([
				getCompany(accessToken, id),
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
 * Get all companies
 * @param properties What fields to be shown
 * @param accessToken The accessToken to use
 */
async function getCompany(accessToken: string, id: number): Promise<any> {

	try {
		const hubspot = new Hubspot({ accessToken });
		// @ts-ignore
		if (hubspot.qs && typeof hubspot.qs === 'object') hubspot.qs.propertyMode = 'value_only';

		try {
			const response = await hubspot.companies.getById(id);

			return response;
		} catch (err) {
			throw new Error(err.message);
		}
	} catch (err) {
		throw new Error(err.message);
	}
}
