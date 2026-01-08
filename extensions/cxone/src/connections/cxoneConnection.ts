import { IConnectionSchema } from "@cognigy/extension-tools";

export const cxOneApiKeyData: IConnectionSchema = {
	type: "cxoneConnection",
	label: "CXone Connection",
	fields: [
		{ fieldName: "accessKeyId" },
        { fieldName: "accessKeySecret" },
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" }
	]
};