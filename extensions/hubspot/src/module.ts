import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { findContactByEmailNode } from "./nodes/findContactByEmail";
import { updateContactNode } from "./nodes/updateContact";
import { createContactNode } from "./nodes/createContact";
import { findContactNode } from "./nodes/findContact";
 
/* import all connections */
import { hubspotConnection } from "./connections/hubspot";

export default createExtension({
	nodes: [
		findContactNode,
		findContactByEmailNode,
		updateContactNode,
		createContactNode
	],

	connections: [
		hubspotConnection
	]
});