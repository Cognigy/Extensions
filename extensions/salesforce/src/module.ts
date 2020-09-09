import { createExtension } from "@cognigy/extension-tools";

import { checkLiveAgentAvailabilityNode } from "./nodes/live-chat/checkLiveAgentAvailability";
import { sendMessageToLiveAgentNode } from "./nodes/live-chat/sendMessageToLiveAgent";
import { startLiveChatNode } from "./nodes/live-chat/startLiveChat";
import { stopLiveChatNode } from "./nodes/live-chat/stopLiveChat";
import { livechatConnection } from "./connections/liveChat";

export default createExtension({
	nodes: [
		checkLiveAgentAvailabilityNode,
		sendMessageToLiveAgentNode,
		startLiveChatNode,
		stopLiveChatNode
	],

	connections: [
		livechatConnection
	]
});