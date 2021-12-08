import { IConnectionSchema } from "@cognigy/extension-tools";

export const azureDevOpsConnection: IConnectionSchema = {
	type: "azuredevops",
	label: "Personal Access Token",
	fields: [
		{ fieldName: "token" },
		{ fieldName: "organizationUrl" },
		{ fieldName: "projectId" }
	]
};