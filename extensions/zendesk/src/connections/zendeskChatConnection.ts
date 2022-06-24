import { IConnectionSchema } from "@cognigy/extension-tools";

export const zendeskChatConnection: IConnectionSchema = {
	type: "zendesk-chat",
	label: "Zendesk Chat",
	fields: [
		{ fieldName: "accessToken" }
	]
};