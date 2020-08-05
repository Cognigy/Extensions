import { createExtension } from "@cognigy/extension-tools";

import { sqlQueryNode } from "./nodes/sqlQuery";
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