import { createExtension } from "@cognigy/extension-tools";

import { sendEmailWithAttachmentNode } from "./nodes/sendEmailWithAttachment";
import { smtpConnection } from "./connections/smtpConnection";
import { getConversationNode } from "./nodes/get-conversation";
import { cognigyApiConnection } from "./connections/cognigyApiConnection";


export default createExtension({
	nodes: [
		sendEmailWithAttachmentNode,
		getConversationNode
	],

	connections: [
		smtpConnection,
		cognigyApiConnection
	]
});