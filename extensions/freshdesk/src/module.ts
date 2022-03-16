import { createExtension } from "@cognigy/extension-tools";

import { createTicketNode } from "./nodes/tickets/createTicket";
import { freshdeskAPIKeyConnection } from "./connections/freshdeskAPIKeyConnection";
import { getTicketNode, onFoundTicket, onNotFoundTicket } from "./nodes/tickets/getTicket";


export default createExtension({
	nodes: [
		createTicketNode,

		getTicketNode,
		onFoundTicket,
		onNotFoundTicket
	],

	connections: [
		freshdeskAPIKeyConnection
	],

	options: {
		label: "Freshdesk"
	}
});