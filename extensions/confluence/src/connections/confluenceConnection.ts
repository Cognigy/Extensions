import { IConnectionSchema } from "@cognigy/extension-tools";

export const confluenceConnection: IConnectionSchema = {
	type: "confluence",
	label: "Confluence Connection",
	fields: [
		{ fieldName: "domain" },
		{ fieldName: "email" },
		{ fieldName: "key" }
	]
};