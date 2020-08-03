import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { findContactByEmailNode } from "./nodes/findContactByEmail";
import { updateContactNode } from "./nodes/updateContact";
import { createContactNode } from "./nodes/createContact";
 
/* import all connections */
import { hubspotConnection } from "./connections/hubspot";

export default createExtension({
	nodes: [
		findContactByEmailNode,
		updateContactNode,
		createContactNode
	],

	connections: [
		hubspotConnection
	]
});