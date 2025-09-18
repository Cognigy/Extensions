import { createExtension } from "@cognigy/extension-tools";
import { confluenceConnection } from "./connections/confluenceConnection";
import { confluenceConnector } from "./knowledge-connectors/confluenceConnector";
import { getAllPagesNode } from "./nodes/getAllPages";
import { searchtNode } from "./nodes/search";

export default createExtension({
	nodes: [searchtNode, getAllPagesNode],

	connections: [confluenceConnection],

	knowledge: [confluenceConnector],

	options: {
		label: "Confluence",
	},
});
