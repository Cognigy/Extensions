import { createExtension } from "@cognigy/extension-tools";

import { sendEmailWithAttachmentNode } from "./nodes/sendEmailWithAttachment";
import { cognigyConnection } from "./connections/cognigyConnection";


export default createExtension({
	nodes: [
		sendEmailWithAttachmentNode
	],

	connections: [
		cognigyConnection
	]
});