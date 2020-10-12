import { IConnectionSchema } from "@cognigy/extension-tools";

export const uiPathConnection: IConnectionSchema = {
	type: "uipath",
	label: "UIPath Connection",
	fields: [
		{ fieldName: "userKey" },
		{ fieldName: "accountLogicalName" },
		{ fieldName: "tenantName" },
		{ fieldName: "clientId" }
	]
};