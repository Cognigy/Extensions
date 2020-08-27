import { createExtension } from "@cognigy/extension-tools";

import { handoverNode } from "./nodes/handover";
import { hangupNode } from "./nodes/hangup";
import { sendMessageNode } from "./nodes/sendMessage";
import { setSessionParamsNode } from "./nodes/setSessionParams";


export default createExtension({
	nodes: [
		sendMessageNode,
		handoverNode,
		hangupNode,
		setSessionParamsNode
	]
});