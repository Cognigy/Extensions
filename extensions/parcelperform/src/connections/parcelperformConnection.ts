import { IConnectionSchema } from "@cognigy/extension-tools";

export const parcelperformConnection: IConnectionSchema = {
	type: "parcelperform",
	label: "API Gateway Integration",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" }
	]
};