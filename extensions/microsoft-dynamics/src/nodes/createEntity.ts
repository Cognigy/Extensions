import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface ICreateEntityParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			organizationUri: string;
		};
		entityType: string;
		entityData: object;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const createEntityNode = createNodeDescriptor({
	type: "createEntity",
	defaultLabel: "Create Entity",
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
			key: "entityData",
			label: "Entity Data",
			type: "json",
			defaultValue: "{}",
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
		{ type: "field", key: "entityData" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#002050"
	},
	function: async ({ cognigy, config, childConfigs }: ICreateEntityParams) => {
		const { api } = cognigy;
		const { connection, entityType, entityData, storeLocation, inputKey, contextKey } = config;
		const { organizationUri } = connection;

		try {
			const response = await axios({
				method: 'post',
				url: `${organizationUri}/api/data/v8.2/${entityType}`,
				headers: {
					'Accept': 'application/json',
					'OData-Version': '4.0',
					'OData-MaxVersion': '4.0',
					'Content-Type': 'application/json'
				},
				data: entityData
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