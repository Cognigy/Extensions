import { IConnectionSchema } from "@cognigy/extension-tools";

export const zendeskOAuthConnection: IConnectionSchema = {
	type: "zendesk-oauth",
	label: "Zendesk OAuth2",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" },
		{ fieldName: "username" },
		{ fieldName: "password" }
	]
};