import { createExtension } from "@cognigy/extension-tools";

import { dbConnection } from "./connections/dbConnection";
import { getDirectionsNode } from "./nodes/getDirections";
import { showTicketNode } from "./nodes/showTicket";

export default createExtension({
	nodes: [
		getDirectionsNode,
		showTicketNode
	],

	connections: [
		dbConnection
	],

	options: {
		label: "Deutsche Bahn"
	}
});