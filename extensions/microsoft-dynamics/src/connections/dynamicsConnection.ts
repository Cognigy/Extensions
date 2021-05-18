import { IConnectionSchema } from "@cognigy/extension-tools";

export const dynamicsConnection: IConnectionSchema = {
	type: "dynamics365",
	label: "Dynamics 365 OAuth",
	fields: [
		{ fieldName: "organizationUri" },
		{ fieldName: "clientId" },
		{ fieldName: "redirectUrl" }
	]
};