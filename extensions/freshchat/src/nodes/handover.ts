import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface IHandoverParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
			domain: string;
		};
		channel_id: string;
		email: string;
		first_name: string;
		last_name: string;
		phone: string;
		properties: any;
		reference_id: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const handoverNode = createNodeDescriptor({
	type: "handover",
	defaultLabel: {
		default: "Handover to Agent"
	},
	summary: {
		default: "Handover a conversation to a human agent",
	},
	fields: [
		{
			key: "connection",
			label: {
				default: "Freshchat Connection"
			},
			type: "connection",
			params: {
				connectionType: "freshchat",
				required: true
			}
		},
		{
			key: "channel_id",
			label: {
				default: "Topic / Channel"
			},
			type: "select",
			description: {
				default: "The topic or channel of the conversation",
			},
			params: {
				required: true,
			},
			optionsResolver: {
				dependencies: ["connection"],
				resolverFunction: async ({ api, config }) => {
					try {
						const projectsResponse = await api.httpRequest({
							method: "GET",
							url: `https://${config.connection.domain}/channels`,
							headers: {
								"Accept": "application/json",
								"Authorization": `Bearer ${config.connection.key}`
							}
						});

						// map file list to "options array"
						return projectsResponse?.data?.channels?.map((channel) => {
							return {
								label: channel?.name,
								value: channel?.id,
							};
						});
					} catch (error) {
						throw new Error(error);
					}
				}
			}
		},
		{
			key: "email",
			label: {
				default: "Email Address"
			},
			type: "cognigyText",
			description: {
				default: "The email address of the user",
			}
		},
		{
			key: "first_name",
			label: {
				default: "First Name"
			},
			type: "cognigyText",
			description: {
				default: "The first name of the user",
			}
		},
		{
			key: "last_name",
			label: {
				default: "Last Name"
			},
			type: "cognigyText",
			description: {
				default: "The last name of the user",
			}
		},
		{
			key: "phone",
			label: {
				default: "Phone"
			},
			type: "cognigyText",
			description: {
				default: "The phone number of the user",
			}
		},
		{
			key: "properties",
			label: {
				default: "Properties"
			},
			type: "json",
			defaultValue: `[{ "name": "orderId", "value": "#1242" }]`,
			description: {
				default: "Additional properties",
			}
		},
		{
			key: "reference_id",
			label: {
				default: "Reference ID"
			},
			type: "cognigyText",
			description: `The system ID that will be used for the user`
		},
		{
			key: "storeLocation",
			type: "select",
			label: {
				default: "Where to store the result"
			},
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
			label: {
				default: "Input Key to store Result"
			},
			defaultValue: "freshchat",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: {
				default: "Context Key to store Result"
			},
			defaultValue: "freshchat",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},
	],
	sections: [
		{
			key: "user",
			label: {
				default: "User Details"
			},
			defaultCollapsed: false,
			fields: [
				"first_name",
				"last_name",
				"email",
				"phone",
				"properties",
				"reference_id"
			]
		},
		{
			key: "storage",
			label: {
				default: "Storage Option"
			},
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
		{ type: "field", key: "channel_id" },
		{ type: "section", key: "user" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#20A849"
	},
	function: async ({ cognigy, config }: IHandoverParams) => {
		const { api, input } = cognigy;
		const { connection, channel_id, first_name, last_name, email, phone, properties, reference_id, storeLocation, contextKey, inputKey } = config;
		const { key, domain } = connection;

		try {

			const createUserResponse = await axios({
				method: "post",
				url: `https://${domain}/users`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Authorization": `Bearer ${key}`
				},
				data: {
					email,
					first_name,
					last_name,
					phone,
					properties,
					reference_id
				}
			});

			const userId = createUserResponse?.data?.id;

			const createConversationResponse = await axios({
				method: "post",
				url: `https://${domain}/conversations`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"Authorization": `Bearer ${key}`
				},
				data: {
					status: "new",
					channel_id,
					"messages": [
						{
							"message_parts": [
								{
									"text": {
										"content": input.text
									}
								}
							],
							channel_id,
							"actor_type": "user",
							"message_type": "normal",
							"actor_id": userId
						}
					],
					"users": [
						{
							"id": userId
						}
					]
				}
			});


			if (storeLocation === "context") {
				api.addToContext(contextKey, createConversationResponse.data, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, createConversationResponse.data);
			}
		} catch (error) {

			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error.message }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});