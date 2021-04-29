import { IConnectionSchema } from "@cognigy/extension-tools";

export const personalAccessTokenConnection: IConnectionSchema = {
	type: "calendryAccessToken",
	label: "Personal Access Token",
	fields: [
		{ fieldName: "personalAccessToken" },
	]
};