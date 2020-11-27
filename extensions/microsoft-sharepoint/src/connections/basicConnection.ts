import { IConnectionSchema } from "@cognigy/extension-tools";

export const basicConnection: IConnectionSchema = {
	type: "basic",
	label: "Sharepoint Connection",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password"}
	]
};