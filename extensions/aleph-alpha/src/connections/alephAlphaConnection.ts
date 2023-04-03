import { IConnectionSchema } from "@cognigy/extension-tools";

export const alephAlphaConnection: IConnectionSchema = {
	type: "aleph-alpha",
	label: "API Token",
	fields: [
		{ fieldName: "apiToken" }
	]
};