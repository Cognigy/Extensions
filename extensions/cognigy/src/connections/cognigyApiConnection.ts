import { IConnectionSchema } from "@cognigy/extension-tools";

export const cognigyApiConnection: IConnectionSchema = {
	type: "cognigy-api",
	label: "Cognigy API Key for OData",
	fields: [
		{ fieldName: "apiKey" }
	]
};