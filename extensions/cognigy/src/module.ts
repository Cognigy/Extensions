import { createExtension } from "@cognigy/extension-tools";
import { intentDisambiguationNode } from "./nodes/intentDisambiguation";
import { chuckNorrisJokesConnector } from "./knowledge-connectors/getChuckNorrisJokes";
import { webPageConnector } from "./knowledge-connectors/getWebPageContent";

export default createExtension({
	nodes: [
		intentDisambiguationNode
	],
	options: {
		label: "Cognigy Customs"
	},
	knowledge: [
		chuckNorrisJokesConnector,
		webPageConnector
	],
});