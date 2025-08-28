import { createExtension } from "@cognigy/extension-tools";
import { intentDisambiguationNode } from "./nodes/intentDisambiguation";
import { chuckNorrisJokesConnector } from "./knowledge-connectors/chuckNorrisJokesConnector";
import { webPageContentConnector } from "./knowledge-connectors/webPageContentConnector";

export default createExtension({
	nodes: [
		intentDisambiguationNode
	],
	options: {
		label: "Cognigy Customs"
	},
	knowledge: [
		chuckNorrisJokesConnector,
		webPageContentConnector
	],
});