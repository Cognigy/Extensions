import { createExtension } from "@cognigy/extension-tools";

import { sqlQueryNode } from "./nodes/sqlQuery";
import { createEntityNode } from "./nodes/createEntity";
import { salesforceConnection } from "./connections/salesforce";
import { getEntityNode } from "./nodes/getEntity";

export default createExtension({
	nodes: [
		sqlQueryNode,
		createEntityNode,
		getEntityNode
	],

	connections: [
		salesforceConnection
	]
});