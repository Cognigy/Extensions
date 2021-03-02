import { IConnectionSchema } from "@cognigy/extension-tools";

export const jiraConnection: IConnectionSchema = {
	type: "jira",
	label: "Jira Connection",
	fields: [
		{ fieldName: "domain" },
		{ fieldName: "email" },
		{ fieldName: "key" }
	]
};