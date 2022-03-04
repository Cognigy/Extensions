import { createExtension } from "@cognigy/extension-tools";
import { cognigyLiveAgentAccessTokenConnection } from "./connections/cognigyLiveAgentConnection";
import { checkLiveAgentAvailabilityNode } from "./nodes/checkLiveAgentAvailability";

export default createExtension({
	nodes: [
		checkLiveAgentAvailabilityNode
	],

	connections: [
		cognigyLiveAgentAccessTokenConnection
	],

	options: {
		label: "Cognigy Live Agent"
	}
});