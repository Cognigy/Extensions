import { IConnectionSchema } from "@cognigy/extension-tools";

export const intentoConnection: IConnectionSchema = {
	type: "intento-connection",
	label: "Intento Enterprise Language Hub",
	fields: [
		{ fieldName: "key" }
	]
};