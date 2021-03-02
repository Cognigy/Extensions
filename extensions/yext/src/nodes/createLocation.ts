import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
const uuidv4 = require('uuid/v4');

export interface ICreateLocationParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		locationName: string;
		address: string;
		city: string;
		state: string;
		zip: string;
		countryCode: string;
		phone: string;
		categoryIds: string[];
		featuredMessage: string;
		apiVersion: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const CreateLocationNode = createNodeDescriptor({
	type: "createLocation",
	defaultLabel: "Create Location",
	preview: {
		key: "locationName",
		type: "text"
	},
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
			key: "locationName",
			label: "Location Name",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "address",
			label: "Address",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "city",
			label: "City",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "state",
			label: "State",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "zip",
			label: "ZIP Code",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "countryCode",
			label: "Country Code",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "phone",
			label: "Phone",
			type: "cognigyText",
			params: {
				required: true
			}
		},
		{
			key: "categoryIds",
			label: "Category IDs",
			type: "textArray",
			description: `In Yext you use categories to sort your branches, thus you can filter your locations e.g. by the categoryId.`,
			params: {
				required: false
			}
		},
		{
			key: "featuredMessage",
			label: "Note Message",
			description: "The featured mesage of a new location, such as New restaurant at Medienhafen",
			type: "cognigyText",
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
			defaultValue: "yext.location",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "yext.location",
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
		{ type: "field", key: "locationName" },
		{ type: "field", key: "address" },
		{ type: "field", key: "city" },
		{ type: "field", key: "state" },
		{ type: "field", key: "zip" },
		{ type: "field", key: "countryCode" },
		{ type: "field", key: "phone" },
		{ type: "field", key: "categoryIds" },
		{ type: "field", key: "featuredMessage" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#02444f"
	},
	function: async ({ cognigy, config }: ICreateLocationParams) => {
		const { api } = cognigy;
		const { locationName, address, city, state, zip, countryCode, phone, categoryIds, featuredMessage, apiVersion, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		// create a location id
		const id = uuidv4();

		try {
			const response = await axios({
				method: 'post',
				url: `https://api.yext.com/v2/accounts/me/locations`,
				headers: {
					'Content-Type': 'application/json',
					'Allow': 'application/json'
				},
				params: {
					api_key: key,
					v: apiVersion
				},
				data: {
					id,
					locationName,
					address,
					city,
					state,
					zip,
					countryCode: countryCode.toLocaleLowerCase(),
					phone,
					categoryIds,
					featuredMessage
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