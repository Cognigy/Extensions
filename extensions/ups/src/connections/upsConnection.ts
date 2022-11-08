import { IConnectionSchema } from "@cognigy/extension-tools";

export const upsConnection: IConnectionSchema = {
	type: "ups-access-key",
	label: "UPS Access Key",
	fields: [
		{ fieldName: "accessKey" }
	]
};