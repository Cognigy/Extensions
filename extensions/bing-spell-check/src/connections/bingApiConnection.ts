import { IConnectionSchema } from "@cognigy/extension-tools";

export const bingApiConnection: IConnectionSchema = {
	type: "bing",
	label: "Holds the API key for Bing.",
	fields: [
		{ fieldName: "key" }
	]
};
