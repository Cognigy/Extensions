import { IConnectionSchema } from "@cognigy/extension-tools";

export const kofaxRobotConnection: IConnectionSchema = {
	type: "kofax-rpa",
	label: "Kofax RPA REST credentials",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "password" },
	]
};