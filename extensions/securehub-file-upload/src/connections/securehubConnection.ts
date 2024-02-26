import { IConnectionSchema } from "@cognigy/extension-tools";

export const securehubConnection: IConnectionSchema = {
	type: "securehub",
	label: "SecureHub Name and Password",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password"}	]
};