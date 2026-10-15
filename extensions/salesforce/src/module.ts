import { createExtension } from "@cognigy/extension-tools";
import { oauth } from "./connections/oauth";
import { awsS3Connection } from "./connections/awsS3";
import { salesforceKnowledgeConnector } from "./knowledge-connectors/salesforceKnowledgeConnector";
import { onEmptyQueryResults, onFoundQueryResults, queryNode } from "./nodes/query";
import { createCaseNode, onErrorCreateCase, onSuccessCreateCase } from "./nodes/createCase";
import { getCaseNode, onErrorGetCase, onSuccessGetCase } from "./nodes/getCase";
import { entityRequestNode, onErrorEntityRequest, onSuccessEntityRequest } from "./nodes/entityRequest";
import { onErrorContact, onFoundContact, onNotFoundContact, searchContactNode } from "./nodes/searchContact";
import { uploadAttachmentToCaseNode, onSuccessUploadAttachment, onPartialSuccessUploadAttachment, onErrorUploadAttachment } from "./nodes/uploadAttachmentToCase";

export default createExtension({
	nodes: [
		createCaseNode,
		onSuccessCreateCase,
		onErrorCreateCase,

		getCaseNode,
		onSuccessGetCase,
		onErrorGetCase,

		searchContactNode,
		onFoundContact,
		onNotFoundContact,
		onErrorContact,

		queryNode,
		onFoundQueryResults,
		onEmptyQueryResults,

		entityRequestNode,
		onSuccessEntityRequest,
		onErrorEntityRequest,

		uploadAttachmentToCaseNode,
		onSuccessUploadAttachment,
		onPartialSuccessUploadAttachment,
		onErrorUploadAttachment
	],

	connections: [
		oauth,
		awsS3Connection
	],

	knowledge: [
		salesforceKnowledgeConnector
	],

	options: {
		label: "Salesforce"
	}
});