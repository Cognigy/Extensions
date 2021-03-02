import { IConnectionSchema } from "@cognigy/extension-tools";

export const smtpConnection: IConnectionSchema = {
	type: "smtp",
	label: "SMTP Connection",
	fields: [
		{ fieldName: "host" },
		{ fieldName: "port" },
		{ fieldName: "security" },
		{ fieldName: "user" },
		{ fieldName: "password" }
	]
};