import { createExtension } from "@cognigy/extension-tools";

import { salesforceConnection } from "./connections/salesforce";
import { loginNode } from "./nodes/login";
import { createEntityNode } from "./nodes/createEntity";
import { deleteEntityNode } from "./nodes/deleteEntity";
import { retrieveEntityNode } from "./nodes/retrieveEntity";
import { updateEntityNode } from "./nodes/updateEntity";
import { queryNode } from "./nodes/query";
import { searchNode } from "./nodes/search";

export default createExtension({
	nodes: [
		loginNode,
		createEntityNode,
		retrieveEntityNode,
		updateEntityNode,
		deleteEntityNode,
		queryNode,
		searchNode
	],

	connections: [
		salesforceConnection
	]
});