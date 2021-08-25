import { IConnectionSchema } from "@cognigy/extension-tools";

export const qnaMakerConnection: IConnectionSchema = {
	type: "qna-maker",
	label: "Authenticate to QnA Maker service",
	fields: [
		{ fieldName: "runtimeEndpoint" },
		{ fieldName: "resourceKey" },
		{ fieldName: "knowledgebaseId" }
	]
};