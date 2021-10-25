import { IConnectionSchema } from "@cognigy/extension-tools";

export const dbConnection: IConnectionSchema = {
	type: "db",
	label: "DB API Key",
	fields: [
		{ fieldName: "key" },
	]
};