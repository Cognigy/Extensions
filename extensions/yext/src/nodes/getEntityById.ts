import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetEntityByIdParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		entity: string;
		entityId: string;
		apiVersion: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getEntitByIdyNode = createNodeDescriptor({
	type: "getEntityById",
	defaultLabel: "Get Entity By ID",
	preview: {
		key: "entity",
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
			key: "entity",
			type: "select",
			label: "Entity",
			description: "The type of entity you want to search for.",
			defaultValue: "Locations",
			params: {
				options: [
					{
						label: "Locations",
						value: "Locations"
					},
					{
						label: "Events",
						value: "Events"
					},
					{
						label: "Products",
						value: "Products"
					},
					{
						label: "Assets",
						value: "Assets"
					},
					{
						label: "Entities",
						value: "Entities"
					},
					{
						label: "Folders",
						value: "Folders"
					},
					{
						label: "Menus",
						value: "Menus"
					},
					{
						label: "Bios",
						value: "Bios"
					}
				],
				required: true
			},
		},
		{
			key: "entityId",
			label: "Entity ID",
			type: "cognigyText",
			description: "The entities id you want to get from Yext",
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
			defaultValue: "yext.entity",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "yext.entity",
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
		{ type: "field", key: "entity" },
		{ type: "field", key: "entityId" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#02444f"
	},
	function: async ({ cognigy, config }: IGetEntityByIdParams) => {
		const { api } = cognigy;
		const { entity, entityId, apiVersion, connection, storeLocation, contextKey, inputKey } = config;
		const { key } = connection;

		try {
			const response = await axios({
				method: 'get',
				url: `https://api.yext.com/v2/accounts/me/${entity.toLowerCase()}/${entityId}`,
				headers: {
					'Content-Type': 'application/json',
					'Allow': 'application/json'
				},
				params: {
					api_key: key,
					v: apiVersion
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