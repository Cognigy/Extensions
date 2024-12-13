import { IConnectionSchema } from "@cognigy/extension-tools";

export const oauth: IConnectionSchema = {
	type: "oauth",
	label: "Salesforce OAuth",
	fields: [
		{ fieldName: "consumerKey" },
		{ fieldName: "consumerSecret" },
		{ fieldName: "loginUrl" }
	]
};