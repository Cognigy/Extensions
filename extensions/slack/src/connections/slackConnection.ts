import { IConnectionSchema } from "@cognigy/extension-tools";

export const slackConnection: IConnectionSchema = {
	type: "slack",
	label: "Slack Connection",
	fields: [
		{ fieldName: "webhookUrl" }
	]
};