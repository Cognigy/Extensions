import { createExtension } from "@cognigy/extension-tools";
import { zendeskConnection } from "./connections/zendeskConnection";
import { zendeskChatConnection } from "./connections/zendeskChatConnection";
import { checkLiveAgentAvailabilityNode, onAgentAvailable, onNoAgentAvailable } from "./nodes/liveChat/checkLiveAgentAvailability";
import { getCategoriesNode } from "./nodes/helpCenter/getCategories";
import { onFoundArticles, onNotFoundArticles, searchArticlesNode } from "./nodes/helpCenter/searchArticles";
import { createTicketNode } from "./nodes/support/createTicket";
import { getTicketNode, onFoundTicket, onNotFoundTicket } from "./nodes/support/getTicket";
import { updateTicketNode } from "./nodes/support/updateTicket";
import { getPhoneNumbersNode } from "./nodes/talk/getPhoneNumbers";
import { requestCallbackNode } from "./nodes/talk/requestCallback";
import { getCurrentQueueActivity } from "./nodes/talk/getCurrentQueueActivity";
import { startLiveChatNode } from "./nodes/liveChat/startLiveChat";
import { zendeskChatAccountKeyConnection } from "./connections/zendeskChatAccountKeyConnection";
import { zendeskAPITokenConnection } from "./connections/zendeskAPITokenConnection";


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

		checkLiveAgentAvailabilityNode,
		onAgentAvailable,
		onNoAgentAvailable,

		startLiveChatNode,

		getPhoneNumbersNode,
		requestCallbackNode,
		getCurrentQueueActivity
	],

	connections: [
		zendeskConnection,
		zendeskChatConnection,
		zendeskChatAccountKeyConnection,
		zendeskAPITokenConnection
	],

	options: {
		label: "Zendesk"
	}
});