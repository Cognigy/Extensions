import { IConnectionSchema } from "@cognigy/extension-tools";

export const sipgatePersonalAccessToken: IConnectionSchema = {
	type: "sipgatePersonalAccessToken",
	label: "Personal Access Token",
	fields: [
		{ fieldName: "personalAccessTokenId" },
		{ fieldName: "personalAccessToken"}
	]
};