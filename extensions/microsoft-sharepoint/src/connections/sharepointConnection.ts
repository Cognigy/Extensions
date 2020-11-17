import { IConnectionSchema } from "@cognigy/extension-tools";

export const sharepointConnection: IConnectionSchema = {
	type: "sharepoint",
	label: "Sharepoint Connection",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret"}
	]
};