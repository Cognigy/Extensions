import { createExtension } from "@cognigy/extension-tools";
import { confluenceConnection } from "./connections/confluenceConnection";
import { searchtNode } from "./nodes/search";
import { getAllPagesNode } from "./nodes/getAllPages";
import { pageContentConnector } from "./knowledge-connectors/pageContentConnector";

export default createExtension({
	nodes: [
		searchtNode,
		getAllPagesNode
	],

	connections: [
		confluenceConnection
	],

	knowledge: [
		pageContentConnector,
	],

	options: {
		label: "Confluence"
	}
});
