import { IConnectionSchema } from "@cognigy/extension-tools";

export const translatorConnection: IConnectionSchema = {
	type: "translator",
	label: "Translator Text API Key",
	fields: [
		{ fieldName: "key" }
	]
};