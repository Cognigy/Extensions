import { createExtension } from "@cognigy/extension-tools";

import { hangupNode } from "./nodes/hangup";
import { sendMessageNode } from "./nodes/sendMessage";
import { setSessionParamsNode } from "./nodes/setSessionParams";


export default createExtension({
	nodes: [
		hangupNode,
		sendMessageNode,
		setSessionParamsNode
	]
});