import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IGetUserParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			personalAccessToken: string;
		};
		userOption: string;
		userId: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getUserNode = createNodeDescriptor({
	type: "getUser",
	defaultLabel: "Get User",
	fields: [
		{
			key: "connection",
			label: "Calendly PAT Connection",
			type: "connection",
			params: {
				connectionType: "calendryAccessToken",
				required: true
			}
		},
		{
			key: "userOption",
			label: "User Option",
			type: "select",
			defaultValue: "me",
			params: {
				required: true,
				options: [
					{
						label: "Me",
						value: "me"
					},
					{
						label: "Other (ID)",
						value: "other"
					}
				]
			}
		},
		{
			key: "userId",
			type: "cognigyText",
			label: "User ID",
			defaultValue: "BGHEVQI4AFH7ZOHA",
			condition: {
				key: "userOption",
				value: "other"
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
			defaultValue: "calendly",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "calendly",
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
		{ type: "field", key: "userOption" },
		{ type: "field", key: "userId" },
		{ type: "section", key: "storageOption" },
	],
	appearance: {
		color: "#676B74"
	},
	function: async ({ cognigy, config }: IGetUserParams) => {
		const { api } = cognigy;
		const { connection, userOption, userId, storeLocation, inputKey, contextKey } = config;
		const { personalAccessToken } = connection;

		let url: string = "";

		if (userOption === "me") {
			url = "https://api.calendly.com/users/me";
		} else {
			url = `https://api.calendly.com/users/${userId}`;
		}

		try {
			const response = await axios({
				method: 'get',
				url,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${personalAccessToken}`
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