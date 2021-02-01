import { IConnectionSchema } from "@cognigy/extension-tools";

export const credentialConnection: IConnectionSchema = {
	type: "credential",
	label: "Credentials",
	fields: [
		{ fieldName: "userName" },
		{ fieldName: "password" }
	]
};