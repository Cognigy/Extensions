import { IConnectionSchema } from "@cognigy/extension-tools";

export const microsoftOnlineConnection: IConnectionSchema = {
	type: "microsoftOnline",
	label: "Microsoft Online Connection",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" },
		{ fieldName: "tenantId" },
        { fieldName: "resource" }
	]
};