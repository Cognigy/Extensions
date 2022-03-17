import { IConnectionSchema } from "@cognigy/extension-tools";

export const freshdeskAPIKeyConnection: IConnectionSchema = {
	type: "freshdesk-apikey",
	label: "Freshdesk API Key",
	fields: [
		{ fieldName: "key" },
		{ fieldName: "subdomain"}
	]
};