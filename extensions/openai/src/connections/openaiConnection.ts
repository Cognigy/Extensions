import { IConnectionSchema } from "@cognigy/extension-tools";

export const openaiConnection: IConnectionSchema = {
	type: "openai",
	label: "API Key",
	fields: [
		{ fieldName: "apiKey" }
	]
};