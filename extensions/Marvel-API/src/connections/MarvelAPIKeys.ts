import { IConnectionSchema } from "@cognigy/extension-tools";

export const marvelAPIKeys: IConnectionSchema = {
	type: "apiKeys",
	label: "Public and private keys for the Marvel-API connection",
	fields: [
		{ fieldName: "publicKey" },
		{ fieldName: "privateKey" }
	]
};