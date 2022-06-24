import { IConnectionSchema } from "@cognigy/extension-tools";

export const serviceAccountConnection: IConnectionSchema = {
	type: "serviceAccount-connection",
	label: "Google Cloud Service Account (Google Sheets API)",
	fields: [
		{ fieldName: "serviceAccountJSON" }
	]
};