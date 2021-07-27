import { createExtension } from "@cognigy/extension-tools";
import { zendeskConnection } from "./connections/zendeskConnection";
import { getCategoriesNode } from "./nodes/helpCenter/getCategories";
import { onFoundArticles, onNotFoundArticles, searchArticlesNode } from "./nodes/helpCenter/searchArticles";
import { createTicketNode } from "./nodes/support/createTicket";
import { getTicketNode, onFoundTicket, onNotFoundTicket } from "./nodes/support/getTicket";
import { updateTicketNode } from "./nodes/support/updateTicket";


export default createExtension({
	nodes: [
		createTicketNode,

		getTicketNode,
		onFoundTicket,
		onNotFoundTicket,

		updateTicketNode,

		searchArticlesNode,
		onFoundArticles,
		onNotFoundArticles,

		getCategoriesNode
	],

	connections: [
		zendeskConnection
	],

	options: {
		label: "Zendesk"
	}
});