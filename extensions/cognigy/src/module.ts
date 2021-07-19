import { createExtension } from "@cognigy/extension-tools";

import { sendEmailWithAttachmentNode } from "./nodes/sendEmailWithAttachment";
import { smtpConnection } from "./connections/smtpConnection";
import { getConversationNode } from "./nodes/getConversation";
import { cognigyApiConnection } from "./connections/cognigyApiConnection";
import { intentDisambiguationNode } from "./nodes/intentDisambiguation";

export default createExtension({
	nodes: [
		sendEmailWithAttachmentNode,
		getConversationNode,
		intentDisambiguationNode
	],

	connections: [
		smtpConnection,
		cognigyApiConnection
	],
	options: {
		label: "Cognigy Custom"
	}
});