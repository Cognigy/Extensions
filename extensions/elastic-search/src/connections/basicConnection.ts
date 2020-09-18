import { IConnectionSchema } from "@cognigy/extension-tools";

export const basicConnection: IConnectionSchema = {
	type: "basic",
	label: "Elastic Search Basic Auth",
	fields: [
		{ fieldName: "node" },
		{ fieldName: "username" },
		{ fieldName: "password" }
	]
};