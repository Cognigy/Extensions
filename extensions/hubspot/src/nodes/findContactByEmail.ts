import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Hubspot from 'hubspot';

const EXTENSION_TIMEOUT = 10000;

export interface IFindContactByEmailRequestParams extends INodeFunctionBaseParams {
	config: {
		email: string;
		fields: string;
		properties: string;
		connection: {
			accessToken: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const findContactByEmailNode = createNodeDescriptor({
	type: "findContactByEmail",
	defaultLabel: "Find Contact By Email",
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
			key: "email",
			label: "The EMail to look for",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "fields",
			label: "The Hubspot fields to include",
			type: "cognigyText",
			defaultValue: "properties"
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
		{ type: "field", key: "email" },
		{ type: "section", key: "storage" },
		{ type: "section", key: "advanced" },
	],
	preview: {
		type: "text",
		key: "email"
	},
	tokens: [
		{
			label: "HS Firstname",
			script: "ci.hubspot.properties.firstname.value",
			type: "answer"
		},
		{
			label: "HS Lastname",
			script: "ci.hubspot.properties.lastname.value",
			type: "answer"
		}
	],
	appearance: {
		color: "#fa7820"
	},

	function: async ({ cognigy, config }: IFindContactByEmailRequestParams) => {
		const { api } = cognigy;
		const {
			storeLocation,
			contextKey,
			inputKey,
			email,
			fields,
			properties,
			connection
		} = config;
		const { accessToken } = connection;

		try {
			if (storeLocation === "context") api.deleteContext(contextKey);

			const result = await Promise.race([
				findContactByEmail(email, fields, properties, accessToken),
				new Promise((resolve, reject) => setTimeout(() => resolve({ "error": "timeout" }), EXTENSION_TIMEOUT)),
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
 * Finds a contact in Hubspot by email
 * Uses the Hubspot API: https://developers.hubspot.com/docs/methods/contacts/get_contact_by_email
 * @param email The email address to find
 * @param flds The fields to return (e.g. properties, etc)
 * @param props The properties to return (e.g. firstname, lastname)
 * @param accessToken The accessToken to use
 */
async function findContactByEmail(email: string, flds: string, props: string, accessToken: string): Promise<any> {
	if (!email) return Promise.reject("No email defined.");
	try {
		const hubspot = new Hubspot({ accessToken });
		// @ts-ignore
		if (hubspot.qs && typeof hubspot.qs === 'object') hubspot.qs.propertyMode = 'value_only';
		let result = {};

		return hubspot.contacts.getByEmail(email)
				.then((res) => {
					// Remove all fields which weren't explicitly requested
					// always keep "properties"
					const fields = (flds) ? flds.split(",") : [];
					if (fields.indexOf("properties") === -1) fields.push("properties");
					Object.keys(res).forEach((key) => {
						if (fields.indexOf(key) === -1) {
							delete res[key];
						}
					});

					// Remove all the properties which weren't explicitly requested
					// Always keep "vid" (the contact ID)
					const properties = (props) ? props.split(",") : [];
					if (properties.indexOf("vid") === -1) properties.push("vid");
					Object.keys(res.properties).forEach((key) => {
						// if key isn't in the defined properties, delete it
						if (properties.indexOf(key) === -1) {
							delete res.properties[key];
						} else if (key === "properties") {
							// if the key is properties, remove versions
							Object.keys(res[key]).forEach((propkey) => {
								delete res[key][propkey]["versions"];
							});
						}
					});
					return res;
				})
				.catch((err) => {
					result = { "error": err.message };
					return result;
				});
	} catch (err) {
		return Promise.reject(err.message);
	}
}
