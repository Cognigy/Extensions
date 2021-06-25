import { IConnectionSchema } from "@cognigy/extension-tools";

export const googleCloudConnection: IConnectionSchema = {
	type: "google-gloud-connection",
	label: "Google Cloud API Key (Vision API)",
	fields: [
		{ fieldName: "key" }
	]
};