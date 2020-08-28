import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { Client } from "@microsoft/microsoft-graph-client";
import getAuthenticatedClient from "../helpers/getAuthenticatedClient";


export interface IGetUserDetailsParams extends INodeFunctionBaseParams {
	config: {
		accessToken: string;
		userSource: string;
		userMail?: string;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const getUserDetailsNode = createNodeDescriptor({
	type: "getUserDetails",
	defaultLabel: "Get User Details",
	preview: {
		key: "userSource",
		type: "text"
	},
	fields: [
		{
			key: "accessToken",
			label: "Microsoft Access Token",
			type: "cognigyText",
			defaultValue: "{{context.microsoft.auth.access_token}}",
			params: {
				required: true,
			}
		},
		{
			key: "userSource",
			type: "select",
			label: "User Information Source",
			defaultValue: "me",
			params: {
				options: [
					{
						label: "My User",
						value: "me"
					},
					{
						label: "All Users",
						value: "all"
					},
					{
						label: "Specific User",
						value: "specific"
					}
				],
				required: true
			},
		},
		{
			key: "userMail",
			label: "Microsoft User E-Mail Address",
			type: "cognigyText",
			condition: {
				key: "userSource",
				value: "specific",
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
			defaultValue: "microsoft.user",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "microsoft.user",
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
		{ type: "field", key: "accessToken" },
		{ type: "field", key: "userSource" },
		{ type: "field", key: "userMail" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00a1f1"
	},
	function: async ({ cognigy, config }: IGetUserDetailsParams) => {
		const { api } = cognigy;
		const { accessToken, userSource, userMail, storeLocation, contextKey, inputKey } = config;

		try {
			const client: Client = getAuthenticatedClient(accessToken);
			let path: string = "";

			if (userSource === "me") path = "/me";
			else if (userSource === "all") path = "/users";
			else if (userSource === "specific") path = `/users/${userMail}`;

			const user = await client.api(path).get();

			if (storeLocation === "context") {
				api.addToContext(contextKey, user, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, user);
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