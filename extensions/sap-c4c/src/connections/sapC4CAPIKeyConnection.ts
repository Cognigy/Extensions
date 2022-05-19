import { IConnectionSchema } from "@cognigy/extension-tools";

export const sapC4CAPIKeyConnection: IConnectionSchema = {
	type: "sap-c4c-apikey",
	label: "Hypatos Basic Authentication",
	fields: [
		{ fieldName: "domain" },
		{ fieldName: "apikey" }
	]
};