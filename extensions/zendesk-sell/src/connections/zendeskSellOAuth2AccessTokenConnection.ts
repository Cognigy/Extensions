import { IConnectionSchema } from "@cognigy/extension-tools";

export const zendeskSellOAuth2AccessTokenConnection: IConnectionSchema = {
	type: "zendesk-sell-access-token",
	label: "Zendesk Sell Access Token",
	fields: [
		{ fieldName: "accessToken" }
	]
};