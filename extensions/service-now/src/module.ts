import { createExtension } from "@cognigy/extension-tools";

import { deleteAttachmentNode } from "./nodes/deleteAttachment";
import { deleteFromTableNode } from "./nodes/deleteFromTable";
import { getAttachmentsByIdNode } from "./nodes/getAttachmentById";
import { getAttachmentsNode } from "./nodes/getAttachments";
import { getFromTableNode } from "./nodes/getFromTable";
import { patchRecordInTableNode } from "./nodes/patchRecordInTable";
import { postAttachmentNode } from "./nodes/postAttachment";
import { postToTableNode } from "./nodes/postToTable";
import { snowConnection } from "./connections/snowConnection";


export default createExtension({
	nodes: [
		deleteAttachmentNode,
		deleteFromTableNode,
		getAttachmentsByIdNode,
		getAttachmentsNode,
		getFromTableNode,
		patchRecordInTableNode,
		postAttachmentNode,
		postToTableNode
	],

	connections: [
		snowConnection
	]
});