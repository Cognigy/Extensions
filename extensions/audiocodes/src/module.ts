import { createExtension } from "@cognigy/extension-tools";

import { audiocodesConnection } from "./connections/audiocodesConnection";
import { getCallNode } from "./nodes/getCall";
import { sendTranscriptMailNode } from "./nodes/sendTranscriptMail";


export default createExtension({
	nodes: [
		sendTranscriptMailNode
	],

	connections: [
		audiocodesConnection
	]
});