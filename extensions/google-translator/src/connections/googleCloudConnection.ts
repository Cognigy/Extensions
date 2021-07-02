import { IConnectionSchema } from "@cognigy/extension-tools";

export const googleCloudConnection: IConnectionSchema = {
	type: "google-cloud-connection",
	label: "Google Cloud API Key (Translation API)",
	fields: [
		{ fieldName: "key" }
	]
};