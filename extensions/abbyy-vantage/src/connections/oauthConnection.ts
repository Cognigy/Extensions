import { IConnectionSchema } from "@cognigy/extension-tools";

export const oauthConnection: IConnectionSchema = {
	type: "abbyy-oauth",
	label: "OAuth",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" },
		{ fieldName: "url" },
		{ fieldName: "username" },
		{ fieldName: "password" }
	]
};