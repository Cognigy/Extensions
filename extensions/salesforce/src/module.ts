import { createExtension } from "@cognigy/extension-tools";

import { sqlQueryNode } from "./nodes/sqlQuery";
import { createEntityNode } from "./nodes/createEntity";
import { salesforceConnection } from "./connections/salesforce";
import { getEntityNode } from "./nodes/getEntity";
import { checkLiveAgentAvailabilityNode } from "./nodes/live-chat/checkLiveAgentAvailability";
import { sendMessageToLiveAgentNode } from "./nodes/live-chat/sendMessageToLiveAgent";
import { startLiveChatNode } from "./nodes/live-chat/startLiveChat";
import { stopLiveChatNode } from "./nodes/live-chat/stopLiveChat";
import { livechatConnection } from "./connections/liveChat";

export default createExtension({
	nodes: [
		sqlQueryNode,
		createEntityNode,
		getEntityNode,
		checkLiveAgentAvailabilityNode,
		sendMessageToLiveAgentNode,
		startLiveChatNode,
		stopLiveChatNode
	],

	connections: [
		salesforceConnection,
		livechatConnection
	]
});