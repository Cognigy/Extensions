import { IConnectionSchema } from "@cognigy/extension-tools";

export const elasticSearchBasicAuthConnection: IConnectionSchema = {
	type: "elastic-search-basic-auth",
	label: "Elastic Search Basic Auth",
	fields: [
		{ fieldName: "host" },
        {fieldName: "auth" },
        { fieldName: "protocol" },
        { fieldName: "port" }
	]
};