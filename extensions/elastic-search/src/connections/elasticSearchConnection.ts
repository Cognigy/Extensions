import { IConnectionSchema } from "@cognigy/extension-tools";

export const elasticSearchConnection: IConnectionSchema = {
	type: "elastic-search",
	label: "Elastic Search Server Host",
	fields: [
		{ fieldName: "host" }
	]
};