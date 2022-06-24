import { IConnectionSchema } from "@cognigy/extension-tools";

export const hypatosConnection: IConnectionSchema = {
	type: "hypatos",
	label: "Hypatos Basic Authentication",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password" }
	]
};