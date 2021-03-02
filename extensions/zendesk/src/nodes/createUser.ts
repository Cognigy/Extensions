import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
const zendesk = require('node-zendesk');

export interface ICreateUserParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			username: string;
			token: string;
			remoteUri: string;
		};
		user: {
			user: any
		}
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const createUserNode = createNodeDescriptor({
	type: "createUser",
	defaultLabel: "Create User",
	fields: [
		{
			key: "connection",
			label: "Zendesk Connection",
			type: "connection",
			params: {
				connectionType: "zendesk",
				required: true
			}
		},
		{
			key: "user",
			label: "User Data",
			type: "json",
			description: "Data of the user to create.",
			params: {
				required: true,
			},
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
			defaultValue: "zendesk.user",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "zendesk.user",
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
		{ type: "field", key: "user" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00363d"
	},
	function: async ({ cognigy, config }: ICreateUserParams) => {
		const { api } = cognigy;
		const { user, connection, storeLocation, contextKey, inputKey } = config;
		const { username, token, remoteUri } = connection;

		const client = zendesk.createClient({
			username,
			token,
			remoteUri
		});

		return new Promise((resolve, reject) => {
			client.users.create(user, (err, statusCode, body, response, res) => {

				if (err) {
					if (storeLocation === "context") {
						api.addToContext(contextKey, { error: err.message }, "simple");
					} else {
						// @ts-ignore
						api.addToInput(inputKey, { error: err.message });
					}
				}

				if (storeLocation === "context") {
					api.addToContext(contextKey, body, "simple");
				} else {
					// @ts-ignore
					api.addToInput(inputKey, body);
				}

				resolve();
			});
		});
	}
});