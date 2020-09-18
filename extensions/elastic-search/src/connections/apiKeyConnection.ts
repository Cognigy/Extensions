import { IConnectionSchema } from "@cognigy/extension-tools";

export const apiKeyConnection: IConnectionSchema = {
	type: "apiKey",
	label: "Elastic Search API Key",
	fields: [
		{ fieldName: "node" },
		{ fieldName: "apiKey" }
	]
};