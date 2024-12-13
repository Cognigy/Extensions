import { createExtension } from "@cognigy/extension-tools";
import { oauth } from "./connections/oauth";
import { basic } from "./connections/basic";
import { onEmptyQueryResults, onFoundQueryResults, queryNode } from "./nodes/query";
import { createCaseNode, onErrorCreateCase, onSuccessCreateCase } from "./nodes/createCase";
import { getCaseNode, onErrorGetCase, onSuccessGetCase } from "./nodes/getCase";
import { entityRequestNode, onErrorEntityRequest, onSuccessEntityRequest } from "./nodes/entityRequest";

export default createExtension({
	nodes: [
		createCaseNode,
		onSuccessCreateCase,
		onErrorCreateCase,

		getCaseNode,
		onSuccessGetCase,
		onErrorGetCase,

		queryNode,
		onFoundQueryResults,
		onEmptyQueryResults,

		entityRequestNode,
		onSuccessEntityRequest,
		onErrorEntityRequest
	],

	connections: [
		basic,
		oauth
	],

	options: {
		label: "Salesforce"
	}
});