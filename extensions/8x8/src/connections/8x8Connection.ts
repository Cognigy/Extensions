import { IConnectionSchema } from "@cognigy/extension-tools";

export const connection: IConnectionSchema = {
	type: "8x8",
	label: "8x8 OAuth",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password" },
		{ fieldName: "tenant" },
		{ fieldName: "region"}
	]
};