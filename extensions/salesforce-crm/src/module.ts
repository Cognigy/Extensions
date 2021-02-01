import { createExtension } from "@cognigy/extension-tools";

import { salesforceConnection } from "./connections/salesforce";
import { createEntityNode } from "./nodes/createEntity";
import { deleteEntityNode } from "./nodes/deleteEntity";
import { retrieveEntityNode } from "./nodes/retrieveEntity";
import { updateEntityNode } from "./nodes/updateEntity";

export default createExtension({
	nodes: [
		createEntityNode,
		retrieveEntityNode,
		updateEntityNode,
		deleteEntityNode
	],

	connections: [
		salesforceConnection
	]
});