import { IConnectionSchema } from "@cognigy/extension-tools";

export const uiPathConnection: IConnectionSchema = {
	type: "uipath",
	label: "UIPath Connection",
	fields: [
		{ fieldName: "client_id" },
		{ fieldName: "refresh_token" },
		{ fieldName: "account_logical_name" },
		{ fieldName: "service_instance_logical_name" }
	]
};