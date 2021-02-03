import { createExtension } from "@cognigy/extension-tools";

import { handoverNode } from "./nodes/handover";
import { closeInterventionNode } from "./nodes/closeIntervention";
import { sendApplePaykNode } from "./nodes/sendApplePay";
import { sendRichLinkNode } from "./nodes/sendRichLink";
import { sendSelectNode } from "./nodes/sendSelect";
import { sendTimePickerNode } from "./nodes/sendTimePicker";

export default createExtension({
	nodes: [
		handoverNode,
		closeInterventionNode,
		sendSelectNode,
		sendRichLinkNode,
		sendTimePickerNode,
		sendApplePaykNode
	],

	connections: []
});
