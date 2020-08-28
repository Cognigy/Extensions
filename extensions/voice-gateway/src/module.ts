import { createExtension } from "@cognigy/extension-tools";

import { handoverNode } from "./nodes/handover";
import { hangupNode } from "./nodes/hangup";
import { setSessionParamsNode } from "./nodes/setSessionParams";


export default createExtension({
	nodes: [
		handoverNode,
		hangupNode,
		setSessionParamsNode
	]
});