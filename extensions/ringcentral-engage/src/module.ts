import { createExtension } from "@cognigy/extension-tools";

import { handoverNode } from "./nodes/handover";
import { closeInterventionNode } from "./nodes/closeIntervention";
import { sendApplePaykNode } from "./nodes/sendApplePay";
import { sendAppleAuthNode } from "./nodes/sendAppleAuthentication";
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
		SendAppleAuthenticateNode
	],

	connections: []
});
