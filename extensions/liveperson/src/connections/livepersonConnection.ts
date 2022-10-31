import { IConnectionSchema } from "@cognigy/extension-tools";

export const livepersonConnection: IConnectionSchema = {
	type: "liveperson",
	label: "Liveperson Connection",
	fields: [
		{ fieldName: "username" },
		{ fieldName: "appKey" },
        { fieldName: "secret" },
        { fieldName: "accountId" },
        { fieldName: "accessToken" },
        { fieldName: "accessTokenSecret" }
	]
};