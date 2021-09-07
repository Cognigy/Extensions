import { createExtension } from "@cognigy/extension-tools";

import { sendEmailWithAttachmentNode } from "./nodes/sendEmailWithAttachment";
import { smtpConnection } from "./connections/smtpConnection";
import { getConversationNode } from "./nodes/getConversation";
import { cognigyApiConnection } from "./connections/cognigyApiConnection";
import { intentDisambiguationNode } from "./nodes/intentDisambiguation";
import { stopFunctionNode } from "./nodes/stopFunction";

export default createExtension({
	nodes: [
		sendEmailWithAttachmentNode,
		getConversationNode,
		intentDisambiguationNode,
		stopFunctionNode
	],

	connections: [
		smtpConnection,
		cognigyApiConnection
	],

	options: {
		label: "Cognigy Customs"
	}
});