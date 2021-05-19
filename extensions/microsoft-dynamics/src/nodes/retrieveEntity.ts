import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IRetrieveEntityParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			organizationUri: string;
		};
		entityType: string;
		accessToken: string;
		entityPrimaryKey: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const retrieveEntityNode = createNodeDescriptor({
	type: "retrieveEntity",
	defaultLabel: "Retrieve Entity",
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
			key: "entityPrimaryKey",
			label: "Entity Primary Key",
			type: "cognigyText",
            description: "Similar to 00000000-0000-0000-0000-000000000001",
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
			defaultValue: "dynamics.entity",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "dynamics.entity",
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
		{ type: "field", key: "entityPrimaryKey" },
		{ type: "section", key: "auth" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#002050"
	},
	function: async ({ cognigy, config }: IRetrieveEntityParams) => {
		const { api } = cognigy;
		const { connection, entityType, accessToken, entityPrimaryKey, storeLocation, inputKey, contextKey } = config;
		const { organizationUri } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `${organizationUri}/api/data/v8.2/${entityType}(${entityPrimaryKey})`,
				headers: {
					'Accept': 'application/json',
					'OData-Version': '4.0',
					'OData-MaxVersion': '4.0',
					'Content-Type': 'application/json; charset=utf-8',
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
				api.addToContext(contextKey, error.message, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, error.message);
			}
		}
	}
});