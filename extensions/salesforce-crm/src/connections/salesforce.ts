import { IConnectionSchema } from "@cognigy/extension-tools";

export const salesforceConnection: IConnectionSchema = {
	type: "salesforce-crm",
	label: "Salesforce CRM Credentials",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password" },
		{ fieldName: "loginUrl" }
	]
};