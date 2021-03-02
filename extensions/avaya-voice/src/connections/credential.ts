import { IConnectionSchema } from "@cognigy/extension-tools";

export const credentialConnection: IConnectionSchema = {
	type: "credential",
	label: "Credentials",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password" }
	]
};