import { IConnectionSchema } from "@cognigy/extension-tools";

export const lekabConnection: IConnectionSchema = {
	type: "lekab",
	label: "Lekab Account",
	fields: [
		{ fieldName: "APIkey" }
	]
};