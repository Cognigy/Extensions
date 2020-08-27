import { IConnectionSchema } from "@cognigy/extension-tools";

export const bambooConnection: IConnectionSchema = {
	type: "bamboo",
	label: "Holds an api-key and company (e.g. cognigy) for an API request.",
	fields: [
		{ fieldName: "key" },
		{ fieldName: "company"}
	]
};