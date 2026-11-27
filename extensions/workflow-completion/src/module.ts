import { createExtension } from "@cognigy/extension-tools";
import { sendCopilotStatusNode } from "./nodes/sendCopilotStatus";

export default createExtension({
	nodes: [
		sendCopilotStatusNode
	],
	connections: [],
	options: {
		label: "CXone Copilot Status"
	}
});
