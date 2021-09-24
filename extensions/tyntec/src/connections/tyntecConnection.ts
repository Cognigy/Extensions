import { IConnectionSchema } from "@cognigy/extension-tools";

export const tyntecConnection: IConnectionSchema = {
	type: "tyntec",
	label: "Tyntec API Key",
	fields: [
		{ fieldName: "key" }
	]
};