import { IConnectionSchema } from "@cognigy/extension-tools";

export const loginConnection: IConnectionSchema = {
	type: "login",
	label: "Microsoft Azure App Connection",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" }
	]
};