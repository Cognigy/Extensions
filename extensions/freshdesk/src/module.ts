import { createExtension } from "@cognigy/extension-tools";

import { createTicketNode } from "./nodes/tickets/createTicket";
import { freshdeskAPIKeyConnection } from "./connections/freshdeskAPIKeyConnection";
import { getTicketNode, onFoundTicket, onNotFoundTicket } from "./nodes/tickets/getTicket";
import { updateTicketNode } from "./nodes/tickets/updateTicket";
import { filterTicketsNode, onFoundTicketByFilter, onNotFoundTicketsByFilter } from "./nodes/tickets/filterTickets";
import { replyToTicketNode } from "./nodes/tickets/replyToTicket";


export default createExtension({
	nodes: [
		createTicketNode,

		getTicketNode,
		onFoundTicket,
		onNotFoundTicket,

		updateTicketNode,

		filterTicketsNode,
		onFoundTicketByFilter,
		onNotFoundTicketsByFilter,

		replyToTicketNode
	],

	connections: [
		freshdeskAPIKeyConnection
	],

	options: {
		label: "Freshdesk"
	}
});