import { IConnectionSchema } from "@cognigy/extension-tools";

export const uiPathInstanceData: IConnectionSchema = {
	type: "instanceData",
	label: "UiPath Instance",
	fields: [
		{ fieldName: "clientId" },
		{ fieldName: "userKey" },
		{ fieldName: "accountLogicalName" },
		{ fieldName: "tenantLogicalName"}
	]
};