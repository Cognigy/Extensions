import { IConnectionSchema } from "@cognigy/extension-tools";

export const zendeskChatAccountKeyConnection: IConnectionSchema = {
	type: "zendesk-chat-account-key",
	label: "Zendesk Chat Account Key",
	fields: [
		{ fieldName: "accountKey" }
	]
};