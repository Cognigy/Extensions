import { IConnectionSchema } from "@cognigy/extension-tools";

export const mssqlConnection: IConnectionSchema = {
	type: "mssql",
	label: "Microsoft Authentication",
	fields: [
		{ fieldName: "user" },
		{ fieldName: "password" },
		{ fieldName: "domain" },
		{ fieldName: "server" },
		{ fieldName: "database" },
		{ fieldName: "user" },
	]
};