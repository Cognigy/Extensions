import { createExtension } from "@cognigy/extension-tools";

import { checkLiveAgentAvailabilityNode } from "./nodes/checkLiveAgentAvailability";
import { sendMessageToLiveAgentNode } from "./nodes/sendMessageToLiveAgent";
import { startLiveChatNode } from "./nodes/startLiveChat";
import { stopLiveChatNode } from "./nodes/stopLiveChat";
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
	],

	options: {
		label: "Salesforce Service Cloud"
	}
});