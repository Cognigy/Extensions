import { IConnectionSchema } from "@cognigy/extension-tools";

export const salesforceConnection: IConnectionSchema = {
	type: "salesforce",
	label: "Salesforce Credentials",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password" },
		{ fieldName: "token" },
		{ fieldName: "loginUrl" }
	]
};