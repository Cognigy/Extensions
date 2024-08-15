import { createExtension } from "@cognigy/extension-tools";

import { createConversationNode } from "./nodes/createConversation";
import { messagingConnection } from "./connections/messagingConnection";

export default createExtension({
	nodes: [
		createConversationNode
	],

	connections: [
		messagingConnection
	],

	options: {
		label: "Salesforce Messaging"
	}
});