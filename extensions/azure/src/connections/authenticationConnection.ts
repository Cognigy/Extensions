import { IConnectionSchema } from "@cognigy/extension-tools";

export const authenticationConnection: IConnectionSchema = {
	type: "authentication",
	label: "App Registration Credentials",
	fields: [
        { fieldName: "clientId" },
        { fieldName: "clientSecret"}
	]
};