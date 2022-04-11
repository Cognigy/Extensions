import { createExtension } from "@cognigy/extension-tools";

import { salesforceConnection } from "./connections/salesforce";
import { loginNode } from "./nodes/login";
import { createEntityNode, onErrorCreateEntity, onSuccessCreateEntity } from "./nodes/createEntity";
import { deleteEntityNode } from "./nodes/deleteEntity";
import { onFoundEntity, onNotFoundEntity, retrieveEntityNode } from "./nodes/retrieveEntity";
import { updateEntityNode } from "./nodes/updateEntity";
import { onEmptyQueryResults, onFoundQueryResults, queryNode } from "./nodes/query";
import { onEmptyResults, onFoundResults, searchNode } from "./nodes/search";
import { retrieveMetadataNode } from "./nodes/retrieveMetadata";
import { listMetadataNode } from "./nodes/listMetadata";

export default createExtension({
	nodes: [
		loginNode,

		createEntityNode,
		onSuccessCreateEntity,
		onErrorCreateEntity,

		retrieveEntityNode,
		onFoundEntity,
		onNotFoundEntity,

		updateEntityNode,
		deleteEntityNode,

		queryNode,
		onFoundQueryResults,
		onEmptyQueryResults,

		searchNode,
		onFoundResults,
		onEmptyResults,

		retrieveMetadataNode,
		listMetadataNode
	],

	connections: [
		salesforceConnection
	],

	options: {
		label: "Salesforce CRM"
	}
});