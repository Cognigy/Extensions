import { IConnectionSchema } from "@cognigy/extension-tools";

export const speechServiceConnection: IConnectionSchema = {
	type: "speechservice",
	label: "Cognitive Services Speech API Key",
	fields: [
		{ fieldName: "key" },
		{ fieldName: "region" }
	]
};