import { IConnectionSchema } from "@cognigy/extension-tools";

export const cloudConnection: IConnectionSchema = {
	type: "cloud",
	label: "Sharepoint Connection",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret"}
	]
};