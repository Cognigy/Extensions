import { IConnectionSchema } from "@cognigy/extension-tools";

export const bmcConnection: IConnectionSchema = {
	type: "bmc",
	label: "BMC Connection",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password"},
		{ fieldName: "authString"},
		{ fieldName: "server"}
	]
};