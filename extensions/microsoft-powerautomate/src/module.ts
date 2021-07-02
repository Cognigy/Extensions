import { createExtension } from "@cognigy/extension-tools";
import { startMicrosoftFlowNode } from "./nodes/startMicrosoftFlow";


export default createExtension({
	nodes: [
		startMicrosoftFlowNode
	]
});