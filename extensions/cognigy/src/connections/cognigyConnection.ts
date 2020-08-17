import { IConnectionSchema } from "@cognigy/extension-tools";

export const cognigyConnection: IConnectionSchema = {
	type: "cognigy",
	label: "SMTP Connection",
	fields: [
		{ fieldName: "host" },
		{ fieldName: "port" },
		{ fieldName: "security" },
		{ fieldName: "user" },
		{ fieldName: "password" }
	]
};