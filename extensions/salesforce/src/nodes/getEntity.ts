import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const jsforce = require('jsforce');


export interface IGetEntityParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			password: string;
			token: string;
			loginUrl: string;
		};
		entity: string;
		entityId: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getEntityNode = createNodeDescriptor({
	type: "getEntity",
	defaultLabel: "Get Entity",
	preview: {
		key: "entity",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "Salesforce Credentials",
			type: "connection",
			params: {
				connectionType: "salesforce",
				required: true
			}
		},
		{
			key: "entity",
			label: "Entity Type",
			description: "What type of entity you want to create in Salesforce CRM.",
			type: "select",
			defaultValue: "Contact",
			params: {
				options: [
					{
						label: "Contact",
						value: "Contact"
					},
					{
						label: "Event",
						value: "Event"
					},
					{
						label: "Account",
						value: "Account"
					}
				],
				required: true
			},
		},
		{
			key: "entityId",
			label: "Entity ID",
			description: "The ID of the entity you want to retrieve.",
			type: "cognigyText",
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
		{ type: "field", key: "entity" },
		{ type: "field", key: "entityId" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#009EDB"
	},
	function: async ({ cognigy, config }: IGetEntityParams) => {
		const { api, input } = cognigy;
		const { entity, entityId, connection, storeLocation, contextKey, inputKey } = config;
		const { loginUrl, token, password, username } = connection;

		return new Promise((resolve, reject) => {
			let conn = new jsforce.Connection();

			if (loginUrl) {
				conn = new jsforce.Connection({
					loginUrl
				});
			} else {
				conn = new jsforce.Connection();
			}

			conn.login(username, password + token, (err: any, res: any): any => {
				if (err) {
					if (storeLocation === "context") {
						api.addToContext(contextKey, err.message, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, err.messgae);
					}
					resolve(input.input);
				} else {

					// Single record creation
					conn.sobject(entity).retrieve(entityId, (err: any, apiResult: any): any => {
						if (err) {
							if (storeLocation === "context") {
								api.addToContext(contextKey, err.message, "simple");
							} else {
								// @ts-ignore
								api.addToInput(inputKey, err.message);
							}
						}

						if (storeLocation === "context") {
							api.addToContext(contextKey, apiResult, "simple");
						} else {
							// @ts-ignore
							api.addToInput(inputKey, apiResult);
						}
						resolve(input.input);
					});
				}
			});
		});
	}
});