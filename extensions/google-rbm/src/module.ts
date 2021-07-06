import { createExtension } from "@cognigy/extension-tools";
import { authenticateNode } from "./nodes/authenticate";

export default createExtension({
	nodes: [
		authenticateNode
	]
});