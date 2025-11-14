import { IConnectionSchema } from "@cognigy/extension-tools";

export const neo4jConnection: IConnectionSchema = {
	type: "neo4jConnection",
	label: "Neo4j Connection",
	fields: [
		{ fieldName: "Host" },
		{ fieldName: "Username" },
		{ fieldName: "Password" }
	]
};

export const neo4jOpenAiKey: IConnectionSchema = {
	type: "openAiApiKey",
	label: "OpenAI API Key",
	fields: [
		{ fieldName: "openAiKey" }
	]
};