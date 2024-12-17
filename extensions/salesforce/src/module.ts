import { createExtension } from "@cognigy/extension-tools";
import { oauth } from "./connections/oauth";
import { onEmptyQueryResults, onFoundQueryResults, queryNode } from "./nodes/query";
import { createCaseNode, onErrorCreateCase, onSuccessCreateCase } from "./nodes/createCase";
import { getCaseNode, onErrorGetCase, onSuccessGetCase } from "./nodes/getCase";
import { entityRequestNode, onErrorEntityRequest, onSuccessEntityRequest } from "./nodes/entityRequest";
import { onFoundContact, onNotFoundContact, searchContactNode } from "./nodes/searchContact";

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

		queryNode,
		onFoundQueryResults,
		onEmptyQueryResults,

		entityRequestNode,
		onSuccessEntityRequest,
		onErrorEntityRequest
	],

	connections: [
		oauth
	],

	options: {
		label: "Salesforce"
	}
});