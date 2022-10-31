import { createExtension } from "@cognigy/extension-tools";
import { livepersonConnection } from "./connections/livepersonConnection";
import { checkLiveAgentAvailabilityNode, onAgentAvailable, onNoAgentAvailable } from "./nodes/checkLiveAgentAvailability";
import { handovertoAgentNode } from "./nodes/handoverToAgent";

export default createExtension({
	nodes: [
		handovertoAgentNode,
		checkLiveAgentAvailabilityNode,
		onAgentAvailable,
		onNoAgentAvailable
	],

	connections: [
		livepersonConnection
	],

	options: {
		label: "LIVEPERSON"
	}
});