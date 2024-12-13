import { IConnectionSchema } from "@cognigy/extension-tools";

export const basic: IConnectionSchema = {
	type: "basic",
	label: "Salesforce Basic Auth",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password" },
		{ fieldName: "loginUrl" }
	]
};