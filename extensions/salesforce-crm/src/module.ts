import { createExtension } from "@cognigy/extension-tools";

import { salesforceConnection } from "./connections/salesforce";
import { loginNode } from "./nodes/login";
import { createEntityNode, onErrorCreateEntity, onSuccessCreateEntity } from "./nodes/createEntity";
import { deleteEntityNode } from "./nodes/deleteEntity";
import { onFoundEntity, onNotFoundEntity, retrieveEntityNode } from "./nodes/retrieveEntity";
import { updateEntityNode } from "./nodes/updateEntity";
import { queryNode } from "./nodes/query";
import { searchNode } from "./nodes/search";

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
		searchNode
	],

	connections: [
		salesforceConnection
	]
});