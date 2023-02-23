import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import Hubspot from 'hubspot';

const EXTENSION_TIMEOUT = 10000;

export interface IGetContactAndOwnerParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			accessToken: string;
		};
		ownerId: string;
		contactId: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const getContactAndOwnerNode = createNodeDescriptor({
	type: "getContactAndOwner",
	defaultLabel: "Get Contact and Owner by Id",
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
            key: "ownerId",
            label: "Owner ID",
            type: "cognigyText",
            description: "The owner ID associated with the company"
        },
		{
            key: "contactId",
            label: "Contact ID",
            type: "cognigyText",
            description: "The contact ID associated with the company"
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
		{ type: "field", key: "ownerId" },
		{ type: "field", key: "contactId" },
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

	function: async ({ cognigy, config }: IGetContactAndOwnerParams) => {
		const { api } = cognigy;
		const {
			storeLocation,
			contextKey,
			inputKey,
			connection,
			ownerId,
			contactId
		} = config;
		const { accessToken } = connection;

		let ownerNum = parseInt(ownerId);
		let contactNum = parseInt(contactId);

		try {
			if (storeLocation === "context") api.deleteContext(contextKey);
			// const properties = ['name', 'country', 'city'];

			const result = await Promise.race([
				getContactAndOwner(accessToken, ownerNum, contactNum),
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
async function getContactAndOwner(accessToken: string, ownerNum: number, contactNum: any): Promise<any> {

	try {
		const hubspot = new Hubspot({ accessToken });
		// @ts-ignore
		if (hubspot.qs && typeof hubspot.qs === 'object') hubspot.qs.propertyMode = 'value_only';

		try {
			const responseOwner = await hubspot.owners.getById(ownerNum);

			const responseContact = await hubspot.contacts.getById(contactNum);
			const response = {responseContact, responseOwner};

			return response;
		} catch (err) {
			throw new Error(err.message);
		}
	} catch (err) {
		throw new Error(err.message);
	}
}
