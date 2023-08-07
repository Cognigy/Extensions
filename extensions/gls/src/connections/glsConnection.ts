import { IConnectionSchema } from "@cognigy/extension-tools";

export const glsConnection: IConnectionSchema = {
	type: "gls",
	label: "GLS Auth",
	fields: [
		{ fieldName: "serverUrl" },
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" }
	]
};