import { IConnectionSchema } from "@cognigy/extension-tools";

export const zendeskAPIConnection: IConnectionSchema = {
	type: "zendesk-api",
	label: "Zendesk API User",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "apiKey" },
		{ fieldName: "subdomain"}
	]
};