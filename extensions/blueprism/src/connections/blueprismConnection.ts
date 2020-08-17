import { IConnectionSchema } from "@cognigy/extension-tools";

export const blueprismConnection: IConnectionSchema = {
	type: "blueprism",
	label: "Blueprism Account",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password"}
	]
};