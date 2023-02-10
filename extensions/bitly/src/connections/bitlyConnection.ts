import { IConnectionSchema } from "@cognigy/extension-tools";

export const bitlyConnection: IConnectionSchema = {
	type: "bitly",
	label: "Bitly Authentication",
	fields: [
		{ fieldName: "accessToken" },
		{ fieldName: "organizationId" }
	]
};