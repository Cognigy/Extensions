import { IConnectionSchema } from "@cognigy/extension-tools";

export const uiPathAccessData: IConnectionSchema = {
	type: "accessData",
	label: "UiPath Connection",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "userKey"}
	]
};