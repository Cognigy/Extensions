import { createExtension } from "@cognigy/extension-tools";

import { handoverNode } from "./nodes/handover";

export default createExtension({
	nodes: [
		handoverNode
	],

	connections: []
});