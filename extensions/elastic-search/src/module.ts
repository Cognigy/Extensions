import { createExtension } from "@cognigy/extension-tools";

import { searchSimpleNode } from "./nodes/searchSimple";
import { searchWithDSLNode } from "./nodes/searchWithDSL";
import { elasticSearchConnection } from "./connections/elasticSearchConnection";


export default createExtension({
	nodes: [
		searchSimpleNode,
		searchWithDSLNode
	],

	connections: [
		elasticSearchConnection
	]
});