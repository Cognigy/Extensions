import { createExtension } from "@cognigy/extension-tools";

import { sqlQueryNode } from "./nodes/crm/sqlQuery";
import { createEntityNode } from "./nodes/crm/createEntity";
import { startLiveChatNode } from "./nodes/serviceCloud/startLiveChat";
import { checkLiveAgentAvailabilityNode } from "./nodes/serviceCloud/checkLiveAgentAvailability";
import { sendMessageToLiveAgentNode } from "./nodes/serviceCloud/sendMessageToLiveAgent";
import { stopLiveChatNode } from "./nodes/serviceCloud/stopLiveChat";
import { getAgentMessageNode } from "./nodes/serviceCloud/getAgentMessage";
import { salesforceConnection } from "./connections/salesforce";
import { livechatConnection } from "./connections/liveChat";


export default createExtension({
	nodes: [
		sqlQueryNode,
		createEntityNode,
		startLiveChatNode,
		checkLiveAgentAvailabilityNode,
		sendMessageToLiveAgentNode,
		stopLiveChatNode,
		getAgentMessageNode
	],

	connections: [
		salesforceConnection,
		livechatConnection
	]
});