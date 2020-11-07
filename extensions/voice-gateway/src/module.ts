import { createExtension } from "@cognigy/extension-tools";
import { agentAssistNode } from "./nodes/agentAssist";

import { handoverNode } from "./nodes/handover";
import { hangupNode } from "./nodes/hangup";
import { playURLNode } from "./nodes/playURL";
import { sendMessageNode } from "./nodes/sendMessage";
import { sendMetaDataNode } from "./nodes/sendMetaData";
import { setSessionParamsNode } from "./nodes/setSessionParams";

export default createExtension({
	nodes: [
		sendMessageNode,
		setSessionParamsNode,
		playURLNode,
		handoverNode,
		hangupNode,
		sendMetaDataNode,
		agentAssistNode
	]
});