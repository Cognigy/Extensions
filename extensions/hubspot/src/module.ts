import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { findContactByEmailNode } from "./nodes/findContactByEmail";

/* import all connections */
import { hubspotConnection } from "./connections/hubspot";

export default createExtension({
	nodes: [
		findContactByEmailNode
	],

	connections: [
		hubspotConnection
	]
});