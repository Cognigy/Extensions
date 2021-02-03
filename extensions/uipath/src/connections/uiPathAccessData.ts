import { IConnectionSchema } from "@cognigy/extension-tools";

export const uiPatchAccessData: IConnectionSchema = {
	type: "accessData",
	label: "UiPath Connection",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "refreshToken"}
	]
};