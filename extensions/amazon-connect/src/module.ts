import { createExtension } from "@cognigy/extension-tools";
import { hangupNode } from "./nodes/hangup";
import { transferNode } from "./nodes/transfer";



export default createExtension({
	nodes: [
		hangupNode,
		transferNode
	],

	options: {
		label: "Amazon Connect"
	}
});