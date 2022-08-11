import { IConnectionSchema } from "@cognigy/extension-tools";

export const crmConnection: IConnectionSchema = {
	type: "eightbyeight-crm",
	label: "8x8 CRM",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password" },
		{ fieldName: "tenant" }
	]
};