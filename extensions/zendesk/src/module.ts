import { createExtension } from "@cognigy/extension-tools";
import { queryNode } from "./nodes/support/searchTickets";
import { zendeskConnection } from "./connections/zendeskConnection";
import { getTicketNode } from "./nodes/getTicket";
import { createTicketNode } from "./nodes/createTicket";
import { updateTicketNode } from "./nodes/updateTicket";
import { createUserNode } from "./nodes/createUser";


export default createExtension({
	nodes: [
		queryNode,
		getTicketNode,
		createTicketNode,
		updateTicketNode,
		createUserNode
	],

	connections: [
		zendeskConnection
	]
});