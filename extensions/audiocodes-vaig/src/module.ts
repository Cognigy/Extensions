import { sendMessageNode } from "./nodes/sendMessage";
import { setSessionParamsNode } from "./nodes/setSessionParams";
import { createExtension } from "@cognigy/extension-tools";
import { agentAssistNode } from "./nodes/agentAssist";
import { callRecordingNode } from "./nodes/callRecording";
import { handoverNode } from "./nodes/handover";
import { hangupNode } from "./nodes/hangup";
import { playURLNode } from "./nodes/playURL";

import { sendMetaDataNode } from "./nodes/sendMetaData";


export default createExtension({
	nodes: [
		sendMessageNode,
		playURLNode,
		handoverNode,
		hangupNode,
		setSessionParamsNode,
		sendMetaDataNode,
		agentAssistNode,
		callRecordingNode
	]
});