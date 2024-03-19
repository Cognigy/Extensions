import { createExtension } from "@cognigy/extension-tools";
import { sendMessageNode } from "./nodes/sendMessage";
import { copilotConnection } from "./connections/copilotConnection";


export default createExtension({
	nodes: [
		sendMessageNode
	],

	connections: [
		copilotConnection
	],

	options: {
		label: "Microsoft Copilot"
	}
});