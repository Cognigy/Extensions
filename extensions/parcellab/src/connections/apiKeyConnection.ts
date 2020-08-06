import { IConnectionSchema } from "@cognigy/extension-tools";

export const apiKeyConnection: IConnectionSchema = {
	type: "apikey",
	label: "Holds an api-key for an API request.",
	fields: [
		{ fieldName: "user" }
	]
};