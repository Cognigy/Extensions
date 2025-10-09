import { IConnectionSchema } from "@cognigy/extension-tools";

export const cxOneApiKeyData: IConnectionSchema = {
	type: "cxoneConnection",
	label: "CXone Api Connection",
	fields: [
		{ fieldName: "username" },
        { fieldName: "password" },
		{ fieldName: "basicToken" }
	]
};