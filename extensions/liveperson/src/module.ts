import { createExtension } from "@cognigy/extension-tools";
import { handovertoAgentNode } from "./nodes/handoverToAgent";

export default createExtension({
	nodes: [
		handovertoAgentNode
	],

	options: {
		label: "LIVEPERSON"
	}
});