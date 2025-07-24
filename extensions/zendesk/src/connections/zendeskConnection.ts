import { IConnectionSchema } from "@cognigy/extension-tools";

export const zendeskConnection: IConnectionSchema = {
	type: "zendesk",
	label: "Zendesk User",
	fields: [
		{ fieldName: "email" },
		{ fieldName: "apiToken" },
		{ fieldName: "subdomain"}
	]
};