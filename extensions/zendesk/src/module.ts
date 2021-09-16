import { createExtension } from "@cognigy/extension-tools";
import { zendeskConnection } from "./connections/zendeskConnection";
import { zendeskOAuthConnection } from "./connections/zendeskOAuthConnection";
import { checkLiveAgentAvailabilityNode } from "./nodes/liveAgent/checkLiveAgentAvailability";
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

		getCategoriesNode,

		checkLiveAgentAvailabilityNode
	],

	connections: [
		zendeskConnection,
		zendeskOAuthConnection
	],

	options: {
		label: "Zendesk"
	}
});