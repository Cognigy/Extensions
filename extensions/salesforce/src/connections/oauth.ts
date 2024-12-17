import { IConnectionSchema } from "@cognigy/extension-tools";

export const oauth: IConnectionSchema = {
	type: "oauth",
	label: "Salesforce Connected App",
	fields: [
		{ fieldName: "consumerKey" },
		{ fieldName: "consumerSecret" },
		{ fieldName: "instanceUrl" }
	]
};