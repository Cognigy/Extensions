import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ISearchEntityParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			organizationUri: string;
		};
		entityType: string;
		accessToken: string;
		select: string;
        filter: string;
        value: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const searchEntityNode = createNodeDescriptor({
	type: "searchEntityNode",
	defaultLabel: "Search Entity",
	fields: [
		{
			key: "connection",
			label: "Dynamics365 Connection",
			type: "connection",
			params: {
				connectionType: "dynamics365",
				required: true
			}
		},
		{
			key: "entityType",
			label: "Entity Type",
			type: "select",
			defaultValue: "contacts",
			params: {
				required: true,
				options: [
					{
						label: "Account",
						value: "accounts"
					},
					{
						label: "Contact",
						value: "contacts"
					}
				]
			}
		},
		{
			key: "accessToken",
			label: "Access Token",
			type: "cognigyText",
			defaultValue: "{{context.microsoft.auth.access_token}}"
		},
		{
			key: "select",
			label: "Return Values",
			type: "cognigyText",
            description: "The values that should be returned from the entity",
            defaultValue: "contactid,firstname,lastname",
			params: {
				required: true
			}
		},
        {
			key: "filter",
			label: "Search Filter",
			type: "cognigyText",
            description: "The search filter such as the mobilephone number",
            defaultValue: "mobilephone",
			params: {
				required: true
			}
		},
        {
			key: "value",
			label: "Search Value",
			type: "cognigyText",
            description: "The search value that filters the results",
            defaultValue: "23456673231",
			params: {
				required: true
			}
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
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
			defaultValue: "input"
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "dynamics.search",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "dynamics.search",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "auth",
			label: "Authentication",
			defaultCollapsed: true,
			fields: [
				"accessToken"
			]
		},
		{
			key: "storageOption",
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
		{ type: "field", key: "entityType" },
		{ type: "field", key: "select" },
        { type: "field", key: "filter" },
        { type: "field", key: "value" },
		{ type: "section", key: "auth" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#002050"
	},
	function: async ({ cognigy, config }: ISearchEntityParams) => {
		const { api } = cognigy;
		const { connection, entityType, accessToken, select, filter, value, storeLocation, inputKey, contextKey } = config;
		const { organizationUri } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `${organizationUri}/api/data/v9.2/${entityType}?$select=${select}&$filter=${encodeURIComponent(filter)}%20eq%20\'${encodeURIComponent(value)}\'`,
				headers: {
					'Accept': 'application/json',
					'Authorization': `Bearer ${accessToken}`
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
				api.addToContext(contextKey, error, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error);
			}
		}
	}
});