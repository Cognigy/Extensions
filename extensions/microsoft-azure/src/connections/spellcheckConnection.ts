import { IConnectionSchema } from "@cognigy/extension-tools";

export const spellcheckConnection: IConnectionSchema = {
	type: "spellcheck",
	label: "Cognitive Services API Key",
	fields: [
		{ fieldName: "key" }
	]
};