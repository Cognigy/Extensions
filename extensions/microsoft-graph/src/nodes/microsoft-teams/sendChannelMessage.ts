import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { Client } from "@microsoft/microsoft-graph-client";
import getAuthenticatedClient from "../../helpers/getAuthenticatedClient";


export interface ISendChannelMessageParams extends INodeFunctionBaseParams {
	config: {
		accessToken: string;
		teamId: string;
		channelId: string;
        message: object;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}
export const sendChannelMessageNode = createNodeDescriptor({
	type: "sendChannelMessage",
	defaultLabel: "Send Channel Message",
    summary: "Send a message to a Microsoft Teams Channel",
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
			key: "teamId",
			type: "cognigyText",
			label: "Team Id",
            description: "The id of the team in Microsoft teams",
			params: {
                required: true
            }
		},
		{
			key: "channelId",
			label: "channelId",
			type: "cognigyText",
			params: {
                required: true
            }
		},
        {
			key: "message",
			label: "Message",
			type: "cognigyText",
            description: "The message that should be sent. Could be HTML as well",
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
		{ type: "field", key: "teamId" },
		{ type: "field", key: "channelId" },
        { type: "field", key: "message" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#00a1f1"
	},
	function: async ({ cognigy, config }: ISendChannelMessageParams) => {
		const { api } = cognigy;
		const { accessToken, teamId, channelId, message, storeLocation, contextKey, inputKey } = config;

		try {
			const client: Client = getAuthenticatedClient(accessToken);

			const chatMessage = await client.api(`/teams/${teamId}/channels/${channelId}/messages`).post(
                {
                    body: {
                        contentType: "html",
                        content: message
                    }
                }
            );

			if (storeLocation === "context") {
				api.addToContext(contextKey, chatMessage, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, chatMessage);
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