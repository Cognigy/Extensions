import { IConnectionSchema } from "@cognigy/extension-tools";

export const mondayConnection: IConnectionSchema = {
	type: "monday",
	label: "API V2 Key",
	fields: [
		{ fieldName: "key" }
	]
};