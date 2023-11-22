// Cognigy.AI Extension Tools
import { createExtension } from "@cognigy/extension-tools";

// Nodes
import { ABConfiguration, GroupA, GroupB, FlowSeperator } from "./nodes/AB";

export default createExtension({
	nodes: [
		ABConfiguration,
		FlowSeperator,
		GroupA,
		GroupB
	]
});