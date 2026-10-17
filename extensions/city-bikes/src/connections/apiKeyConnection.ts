import { IConnectionSchema } from "@cognigy/extension-tools";

export const apiKeyConnection: IConnectionSchema = {
	type: "api-key",
	label: "Holds an api-key for an API request.",
	fields: [
		{ fieldName: "key" }
	]
};