import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Hubspot from 'hubspot';

export interface IFindContactParams extends INodeFunctionBaseParams {
	config: {
		query: string;
		properties: string;
		connection: {
			apikey: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const findContactNode = createNodeDescriptor({
	type: "findContact",
	defaultLabel: "Find Contact",
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
			key: "query",
			label: "The query to search for",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "properties",
			label: "The Hubspot properties to include",
			type: "cognigyText",
			defaultValue: "firstname,lastname"
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
		},
		{
			key: "advanced",
			label: "Text Fields",
			defaultCollapsed: true,
			fields: [
				"fields",
				"properties"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "query" },
		{ type: "section", key: "storage" },
		{ type: "section", key: "advanced" },
	],
	preview: {
		type: "text",
		key: "email"
	},
	appearance: {
		color: "#fa7820"
	},

	function: async ({ cognigy, config }: IFindContactParams) => {
		const { api } = cognigy;
		const {
			storeLocation,
			contextKey,
			inputKey,
			query,
			properties,
			connection
		} = config;
		const { apikey } = connection;

		try {
			if (storeLocation === "context") api.deleteContext(contextKey);

			const result = await findContact(query, properties, apikey);

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
 * Finds a contact in Hubspot
 * @param query The email address to find
 * @param props The properties to return (e.g. firstname, lastname)
 * @param apiKey The apiKey to use
 */
async function findContact(query: string, props: string, apiKey: string): Promise<any> {
	if (!query) return Promise.reject("No query defined.");

	try {
		const hubspot = new Hubspot({ apiKey });
		// @ts-ignore
		if (hubspot.qs && typeof hubspot.qs === 'object') hubspot.qs.propertyMode = 'value_only';
		let result = {};

		try {
			const response = hubspot.contacts.search(query);

			const contacts = (response.contacts && Array.isArray(response.contacts) && response.contacts.length > 0) ? response.contacts : null;
			const properties = (props) ? props.split(",") : [];

			if (properties.indexOf("vid") === -1) properties.push("vid");

			if (contacts) {
				contacts.forEach((res) => {
					Object.keys(res.properties).forEach((key) => {
						// if key isn't in the defined properties, delete it
						if (properties.indexOf(key) === -1) delete res.properties[key];
						else if (key === "properties") {
							// if the key is properties, remove versions
							Object.keys(res[key]).forEach((propkey) => {
								delete res[key][propkey]["versions"];
							});
						}
					});
				});
			}

			return response;
		} catch (err) {
			return {
				error: err.message
			};
		}

	} catch (err) {
		throw new Error(err.message);
	}
}
