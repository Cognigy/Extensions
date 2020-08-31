import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { handoverNode } from "./nodes/handover";
import { sendMessageNode } from "./nodes/sendMessage";
import { setSessionParamsNode } from "./nodes/setSessionParams";
import { hangupNode } from "./nodes/hangup";
import { playURLNode } from "./nodes/playURL";

export default createExtension({
	nodes: [
		sendMessageNode,
		setSessionParamsNode,
		hangupNode,
		playURLNode,
		handoverNode
	]
} as any);