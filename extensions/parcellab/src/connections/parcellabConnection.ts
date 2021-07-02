import { IConnectionSchema } from "@cognigy/extension-tools";

export const parcellabConnection: IConnectionSchema = {
	type: "parcellab",
	label: "Parcel Lab User",
	fields: [
		{ fieldName: "user" }
	]
};