import { IConnectionSchema } from "@cognigy/extension-tools";

export const storeAPIConnection: IConnectionSchema = {
	type: "store-api-access-token",
	label: "Store Access Token",
	fields: [
		{ fieldName: "accessToken" },
		{ fieldName: "storeHash" }
	]
};