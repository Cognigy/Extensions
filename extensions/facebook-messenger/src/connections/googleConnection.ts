import { IConnectionSchema } from "@cognigy/extension-tools";

export const googleConnection: IConnectionSchema = {
	type: "google",
	label: "Google Maps API Key",
	fields: [
		{ fieldName: "key" }
	]
};