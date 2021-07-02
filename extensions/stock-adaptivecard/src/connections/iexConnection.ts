import { IConnectionSchema } from "@cognigy/extension-tools";

export const iexConnection: IConnectionSchema = {
	type: "iex",
	label: "Holds the authorization token for IEX API",
	fields: [
		{ fieldName: "token" }
	]
};