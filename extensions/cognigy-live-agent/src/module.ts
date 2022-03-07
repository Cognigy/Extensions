import { createExtension } from "@cognigy/extension-tools";
import { cognigyLiveAgentAccessTokenConnection } from "./connections/cognigyLiveAgentConnection";
import { checkLiveAgentAvailabilityNode, onAgentAvailable, onNoAgentAvailable } from "./nodes/checkLiveAgentAvailability";

export default createExtension({
	nodes: [
		checkLiveAgentAvailabilityNode,
		onAgentAvailable,
		onNoAgentAvailable
	],

	connections: [
		cognigyLiveAgentAccessTokenConnection
	],

	options: {
		label: "Cognigy Live Agent"
	}
});