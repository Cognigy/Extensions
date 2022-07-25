import { createExtension } from "@cognigy/extension-tools";
import { asanaPATConnection } from "./connections/asanaPATConnection";
import { getTicketByIdNode, onFoundTicket, onNotFoundTicket } from "./nodes/getTaskById";

export default createExtension({
	nodes: [
		getTicketByIdNode,
		onFoundTicket,
		onNotFoundTicket
	],

	connections: [
		asanaPATConnection
	],

	options: {
		label: "Asana"
	}
});