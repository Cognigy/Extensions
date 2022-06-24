import { createExtension } from "@cognigy/extension-tools";
import { confluenceConnection } from "./connections/confluenceConnection";
import { searchtNode } from "./nodes/search";
import { getAllPagesNode } from "./nodes/getAllPages";

export default createExtension({
	nodes: [
		searchtNode,
		getAllPagesNode
	],

	connections: [
		confluenceConnection
	],

	options: {
		label: "Confluence"
	}
});