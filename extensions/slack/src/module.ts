import { createExtension } from "@cognigy/extension-tools";

import { sendMessageToLiveAgentNode } from "./nodes/live-chat/sendMessageToLiveAgent";
import { slackConnection } from "./connections/slackConnection";

export default createExtension({
	nodes: [
		sendMessageToLiveAgentNode
	],

	connections: [
		slackConnection
	]
});