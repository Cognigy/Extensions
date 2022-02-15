import { IConnectionSchema } from "@cognigy/extension-tools";

export const AlfrescoConnection: IConnectionSchema = {
	type: "alfresco-instance",
	label: "Alfresco API",
	fields: [
		{ fieldName: "ALF_API_URL" },
		{ fieldName: "username"},
		{ fieldName: "password"}
	]
};