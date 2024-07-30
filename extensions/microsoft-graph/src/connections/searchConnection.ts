import { IConnectionSchema } from "@cognigy/extension-tools";

export const searchConnection: IConnectionSchema = {
	type: "search",
	label: "Microsoft Graph Search Connection",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" },
		{ fieldName: "tenantId" }
	]
};