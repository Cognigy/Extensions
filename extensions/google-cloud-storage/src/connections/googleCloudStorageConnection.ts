import { IConnectionSchema } from "@cognigy/extension-tools";

export const googleCloudStorageConnection: IConnectionSchema = {
	type: "google-cloud-bucket",
	label: "Google Cloud Storage credentials JSON",
	fields: [
		{ fieldName: "credentialsJson" }
	]
};