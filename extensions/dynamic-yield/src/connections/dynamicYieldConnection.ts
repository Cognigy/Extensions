import { IConnectionSchema } from "@cognigy/extension-tools";

export const dynamicYieldConnection: IConnectionSchema = {
	type: "dynamic-yield",
	label: "Authentication",
	fields: [
		{ fieldName: "key" },
		{ fieldName: "region"}
	]
};