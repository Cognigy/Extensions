import { IConnectionSchema } from "@cognigy/extension-tools";

export const stripeConnection: IConnectionSchema = {
	type: "stripe",
	label: "Secret API Key",
	fields: [
		{ fieldName: "secretKey" },
	]
};