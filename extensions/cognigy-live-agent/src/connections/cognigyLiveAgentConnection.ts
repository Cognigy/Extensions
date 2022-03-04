import { IConnectionSchema } from "@cognigy/extension-tools";

export const cognigyLiveAgentAccessTokenConnection: IConnectionSchema = {
	type: "cognigy-live-agent-access-token",
	label: "Live Agent Access Token",
	fields: [
		{ fieldName: "apiKey" },
		{ fieldName: "baseUrl" },
		{ fieldName: "accountId" }
	]
};