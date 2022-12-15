import { createExtension } from "@cognigy/extension-tools";
import { livepersonConnection } from "./connections/livepersonConnection";
import { checkLiveAgentAvailabilityNode, onAgentAvailable, onNoAgentAvailable } from "./nodes/checkLiveAgentAvailability";
import { loginNode } from "./nodes/login"
import { handovertoAgentNode } from "./nodes/handoverToAgent";

export default createExtension({
	nodes: [
		handovertoAgentNode,
		checkLiveAgentAvailabilityNode,
		onAgentAvailable,
		onNoAgentAvailable,
		loginNode
	],

	connections: [
		livepersonConnection
	],

	options: {
		label: "LIVEPERSON"
	}
});