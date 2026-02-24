import { createExtension } from "@cognigy/extension-tools";
import { workflowCompletionNode } from "./nodes/workflowCompletion";

export default createExtension({
	nodes: [
		workflowCompletionNode
	],
	connections: [],
	options: {
		label: "Workflow Completion"
	}
});