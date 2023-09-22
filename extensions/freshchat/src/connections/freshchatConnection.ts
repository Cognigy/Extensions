import { IConnectionSchema } from "@cognigy/extension-tools";

export const freshchatConnection: IConnectionSchema = {
	type: "freshchat",
	label: "Freshchat",
	fields: [
		{ fieldName: "key" },
		{ fieldName: "domain"}
	]
};