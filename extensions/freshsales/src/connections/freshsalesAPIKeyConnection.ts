import { IConnectionSchema } from "@cognigy/extension-tools";

export const freshsalesAPIKeyConnection: IConnectionSchema = {
	type: "freshsales-apikey",
	label: "Freshsales API Key",
	fields: [
		{ fieldName: "key" },
		{ fieldName: "subdomain"}
	]
};