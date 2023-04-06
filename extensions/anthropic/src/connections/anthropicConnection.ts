import { IConnectionSchema } from "@cognigy/extension-tools";

export const anthropicConnection: IConnectionSchema = {
	type: "anthropic",
	label: "API Key",
	fields: [
		{ fieldName: "apiKey" }
	]
};