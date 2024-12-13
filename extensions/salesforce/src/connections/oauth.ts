import { IConnectionSchema } from "@cognigy/extension-tools";

export const oauth: IConnectionSchema = {
	type: "oauth",
	label: "Salesforce OAuth",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" },
		{ fieldName: "loginUrl" }
	]
};