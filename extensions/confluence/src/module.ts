import { createExtension } from "@cognigy/extension-tools";
import { confluenceConnection } from "./connections/confluenceConnection";
import { searchtNode } from "./nodes/search";
import { getAllPagesNode } from "./nodes/getAllPages";
import { confluenceConnector } from "./knowledge-connectors/confluenceConnector";

export default createExtension({
	nodes: [
		searchtNode,
		getAllPagesNode
	],

	connections: [
		confluenceConnection
	],

	knowledge: [
		confluenceConnector,
	],

	options: {
		label: "Confluence"
	}
});
