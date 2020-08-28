import { IConnectionSchema } from "@cognigy/extension-tools";

export const kofaxRobotConnection: IConnectionSchema = {
	type: "kofax-rpa",
	label: "Kofax RPA API Key",
	fields: [
		{ fieldName: "key" }
	]
};