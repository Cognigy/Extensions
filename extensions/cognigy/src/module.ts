import { createExtension } from "@cognigy/extension-tools";
import { intentDisambiguationNode } from "./nodes/intentDisambiguation";

export default createExtension({
	nodes: [
		intentDisambiguationNode
	],
	options: {
		label: "Cognigy Customs"
	}
});