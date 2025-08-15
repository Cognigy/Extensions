import { createExtension } from "@cognigy/extension-tools";
import { confluenceConnection } from "./connections/confluenceConnection";
import { searchtNode } from "./nodes/search";
import { getAllPagesNode } from "./nodes/getAllPages";
import { confluenceKnowledgeExtension } from "./knowledge-connector/knowledge";

export default createExtension({
	nodes: [
		searchtNode,
		getAllPagesNode
	],

	connections: [
		confluenceConnection
	],

	knowledge: [
		confluenceKnowledgeExtension,
	],

	options: {
		label: "Confluence"
	}
});
