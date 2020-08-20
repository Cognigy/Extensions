import { IConnectionSchema } from "@cognigy/extension-tools";

export const bingSearchConnection: IConnectionSchema = {
	type: "bingsearch",
	label: "Bing Search API Key",
	fields: [
		{ fieldName: "key" }
	]
};