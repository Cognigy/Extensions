import { IConnectionSchema } from "@cognigy/extension-tools";

export const classifyIntentOpenAiKey: IConnectionSchema = {
	type: "openAiApiKey",
	label: "OpenAI API Key",
	fields: [
		{ fieldName: "openAiKey" }
	]
};