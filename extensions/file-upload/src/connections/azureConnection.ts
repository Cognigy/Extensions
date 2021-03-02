import { IConnectionSchema } from "@cognigy/extension-tools";

export const azureConnection: IConnectionSchema = {
	type: "azure",
	label: "Azure User Account",
	fields: [
		{ fieldName: "secretAccessKey"}
	]
};