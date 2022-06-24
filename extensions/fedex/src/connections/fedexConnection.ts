import { IConnectionSchema } from "@cognigy/extension-tools";

export const fedexConnection: IConnectionSchema = {
	type: "fedex",
	label: "FedEx OAuth",
	fields: [
		{ fieldName: "serverUrl" },
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" }
	]
};