import { IConnectionSchema } from "@cognigy/extension-tools";

export const asanaPATConnection: IConnectionSchema = {
	type: "asana-pat",
	label: "Asana PAT",
	fields: [
		{ fieldName: "personalAccessToken" }
	]
};