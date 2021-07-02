import { IConnectionSchema } from "@cognigy/extension-tools";

export const yextConnection: IConnectionSchema = {
	type: "yext",
	label: "Yext API Key",
	fields: [
		{ fieldName: "key" }
	]
};