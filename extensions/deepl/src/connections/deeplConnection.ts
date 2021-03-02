import { IConnectionSchema } from "@cognigy/extension-tools";

export const deeplConnection: IConnectionSchema = {
	type: "deepl",
	label: "DeepL API Key",
	fields: [
		{ fieldName: "key" },
	]
};