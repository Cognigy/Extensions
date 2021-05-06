import { createExtension } from "@cognigy/extension-tools";

import { dynamicsConnection } from "./connections/dynamicsConnection";
import { createEntityNode } from "./nodes/createEntity";
import { retrieveEntityNode } from "./nodes/retrieveEntity";


export default createExtension({
	nodes: [
		createEntityNode,
		retrieveEntityNode
	],

	connections: [
		dynamicsConnection
	]
});