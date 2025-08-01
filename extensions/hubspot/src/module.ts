import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { createTicket } from "./nodes/createTicket";
import { createContactNode } from "./nodes/createContact";
import { findEntity } from "./nodes/findEntity";
import { createEngagementNode } from "./nodes/createEngagement";
import { createCompanyNode } from "./nodes/createCompany";
import { updateEntity } from "./nodes/updateEntity";

/* import all connections */
import { hubspotConnection } from "./connections/hubspot";

export default createExtension({
	nodes: [
		createTicket,
		findEntity,
		updateEntity,
		createContactNode,
		createCompanyNode,
		createEngagementNode
	],
	connections: [
		hubspotConnection
	],
	options: {
		label: "Hubspot"
	}
});