import { IConnectionSchema } from "@cognigy/extension-tools";

export const googleFirebaseConnection: IConnectionSchema = {
	type: "google-firebase-connection",
	label: "Google Firebase Project Credentials",
	fields: [
		{ fieldName: "apiKey" },
		{ fieldName: "projectId" },
		{ fieldName: "databaseName" },
		{fieldName: "bucket" }

	]
};