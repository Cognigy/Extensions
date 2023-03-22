import { IConnectionSchema } from "@cognigy/extension-tools";

export const commercetoolsConnection: IConnectionSchema = {
	type: "commercetools",
	label: "Commercetools Authentication",
	fields: [
		{ fieldName: "projectKey"},
		{ fieldName: "clientId" },
		{ fieldName: "secret" },
		{ fieldName: "scope" },
		{ fieldName: "apiUrl" },
		{ fieldName: "authUrl" }
	]
};