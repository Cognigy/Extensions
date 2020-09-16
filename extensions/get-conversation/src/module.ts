import { createExtension } from "@cognigy/extension-tools";

import { cognigyApiConnection } from "./connections/cognigyApiConnection";
import { getConversationNode } from "./nodes/get-conversation";


export default createExtension({
	nodes: [
		getConversationNode
	],

	connections: [
		cognigyApiConnection
	]
});