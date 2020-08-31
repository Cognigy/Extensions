import { IConnectionSchema } from "@cognigy/extension-tools";

export const hereConnection: IConnectionSchema = {
	type: "here",
	label: "Here Connection",
	fields: [
		{ fieldName: "appId" },
		{ fieldName: "apiKey" }
	]
};