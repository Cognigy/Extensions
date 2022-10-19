import { IConnectionSchema } from "@cognigy/extension-tools";

export const intrafindAuthData: IConnectionSchema = {
	type: "intrafind",
	label: "Intrafind Authentication",
	fields: [
		{ fieldName: "apiKey" },
        { fieldName: "apiSecret" }
	]
};