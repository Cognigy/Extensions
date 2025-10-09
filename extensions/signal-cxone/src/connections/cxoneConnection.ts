import { IConnectionSchema } from "@cognigy/extension-tools";

export const cxOneApiKeyData: IConnectionSchema = {
	type: "cxoneConnection",
	label: "CXone Api Connection",
	fields: [
		{ fieldName: "accessKeyId" },
        { fieldName: "accessKeySecret" },
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" }
	]
};