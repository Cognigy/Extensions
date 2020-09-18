import { IConnectionSchema } from "@cognigy/extension-tools";

export const cloudConnection: IConnectionSchema = {
	type: "cloud",
	label: "Elastic Search Cloud",
	fields: [
		{ fieldName: "cloudId" },
        { fieldName: "username" },
        { fieldName: "password" }
	]
};