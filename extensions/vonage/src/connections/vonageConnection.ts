import { IConnectionSchema } from "@cognigy/extension-tools";

export const vonageConnection: IConnectionSchema = {
	type: "vonage",
	label: "Vonage API Credentials",
	fields: [
		{ fieldName: "apiKey" },
		{ fieldName: "apiSecret" }
	]
};