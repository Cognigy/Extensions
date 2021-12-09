import { IConnectionSchema } from "@cognigy/extension-tools";

export const microsoftBotAuthInfo: IConnectionSchema = {
	type: "microsoftBotCredentials",
	label: "Microsoft Bot Credentials",
	fields: [
		{ fieldName: "appId" },
		{ fieldName: "appPassword" }
	]
};