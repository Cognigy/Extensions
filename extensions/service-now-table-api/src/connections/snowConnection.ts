import { IConnectionSchema } from "@cognigy/extension-tools";

export const snowConnection: IConnectionSchema = {
	type: "snow",
	label: "Service Now Connection",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password"},
		{ fieldName: "instance"}
	]
};