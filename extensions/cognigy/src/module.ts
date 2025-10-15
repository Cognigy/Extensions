import { createExtension } from "@cognigy/extension-tools";
import { webPageContentConnector } from "./knowledge-connectors/webPageContentConnector";
import { intentDisambiguationNode } from "./nodes/intentDisambiguation";

export default createExtension({
	nodes: [intentDisambiguationNode],
	options: {
		label: "Cognigy Customs",
	},
	knowledge: [webPageContentConnector],
});
