import { IConnectionSchema } from "@cognigy/extension-tools";

export const messagingConnection: IConnectionSchema = {
	type: "messaging",
	label: "Salesforce Messaging Credentials",
	fields: [
		{ fieldName: "url"},
		{ fieldName: "orgId" },
		{ fieldName: "esDeveloperName" }
	]
};