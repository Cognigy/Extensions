import { createExtension } from "@cognigy/extension-tools";
import { confluenceConnection } from "./connections/confluenceConnection";
import { searchtNode } from "./nodes/search";


export default createExtension({
	nodes: [
		searchtNode
	],

	connections: [
		confluenceConnection
	]
});