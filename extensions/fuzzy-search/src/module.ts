import { createExtension } from "@cognigy/extension-tools";
import { searchNode } from "./nodes/search";

export default createExtension({
	nodes: [
		searchNode
	]
});