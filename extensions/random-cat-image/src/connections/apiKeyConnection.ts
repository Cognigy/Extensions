import { IConnectionSchema } from "@cognigy/extension-tools";

export const apiKeyConnection: IConnectionSchema = {
	type: "api-key",
	label: "Holds the api-key for a Cognigy.AI 4.0.0 API request.",
	fields: [
		{ fieldName: "key" }
	]
};