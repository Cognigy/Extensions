import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import jsforce from 'jsforce';

export interface IUpdateEntityParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			loginUrl: string;
		};
		entityType: string,
		entityId: string;
		entityRecord: object;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const updateEntityNode = createNodeDescriptor({
	type: "updateEntity",
	defaultLabel: "Update Entity",
	fields: [
		{
			key: "connection",
			label: "Salesforce CRM Credentials",
			type: "connection",
			params: {
				connectionType: "salesforce-crm",
				required: true
			}
		},
		{
			key: "entityType",
			type: "select",
			label: "Entity Type",
			defaultValue: "Contact",
			params: {
				options: [
					{
						label: "Account",
						value: "Account"
					},
					{
						label: "Contact",
						value: "Contact"
					},
					{
						label: "Event",
						value: "Event"
					}
				],
				required: true
			},
		},
		{
			key: "entityId",
			type: "cognigyText",
			label: "Entity ID",
			defaultValue: "{{input.salesforce.entity.id}}",
			description: "The ID of the Salesforce Entity you want to get",
			params: {
				required: true
			}
		},
		{
			key: "entityRecord",
			type: "json",
			label: "Entity Record",
			description: "The values that should be changed in the entity",
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
			defaultValue: "salesforce.entity",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "salesforce.entity",
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
		{ type: "field", key: "entityType" },
		{ type: "field", key: "entityId" },
		{ type: "field", key: "entityRecord" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#009EDB"
	},
	function: async ({ cognigy, config }: IUpdateEntityParams) => {
		const { api } = cognigy;
		const { entityType, entityId, entityRecord, connection, storeLocation, contextKey, inputKey } = config;
		const { username, password, loginUrl } = connection;


		try {

			const conn = new jsforce.Connection({
				loginUrl
			});

			const userInfo = await conn.login(username, password);

			// Single record update
			const options = Object.assign({ Id: entityId }, entityRecord);
			const entity = await conn.sobject(entityType).update(options);

			if (storeLocation === "context") {
				api.addToContext(contextKey, entity, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, entity);
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