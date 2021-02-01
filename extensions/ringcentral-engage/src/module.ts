import { createExtension } from "@cognigy/extension-tools";

import { handoverNode } from "./nodes/handover";
import { sendRichLinkNode } from "./nodes/sendRichLink";
import { sendSelectNode } from "./nodes/sendSelect";
import { sendTimePickerNode } from "./nodes/sendTimePicker";

export default createExtension({
	nodes: [
		handoverNode,
		sendSelectNode,
		sendRichLinkNode,
		sendTimePickerNode
	],

	connections: []
});