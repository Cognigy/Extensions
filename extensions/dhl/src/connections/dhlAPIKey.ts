import { IConnectionSchema } from "@cognigy/extension-tools";

export const dhlApiKeyData: IConnectionSchema = {
	type: "dhl",
	label: "DHL Api Key",
	fields: [
		{ fieldName: "apiKey" },
        { fieldName: "apiSecret" }
	]
};