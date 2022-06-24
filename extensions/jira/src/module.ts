import { createExtension } from "@cognigy/extension-tools";
import { createTicketNode } from "./nodes/createTicket";
import { jiraConnection } from "./connections/jiraConnection";
import { getTicketNode } from "./nodes/getTicket";
import { extractTicketFromTextNode } from "./nodes/extractTicketFromText";


export default createExtension({
	nodes: [
		createTicketNode,
		getTicketNode,
		extractTicketFromTextNode
	],

	connections: [
		jiraConnection
	],

	options: {
		label: "Jira"
	}
});