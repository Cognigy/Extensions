import { createExtension } from "@cognigy/extension-tools";
import { azureDevOpsConnection } from "./connections/azureDevOpsConnection";
import { createWorkItemNode } from "./nodes/createWorkItem";

export default createExtension({
	nodes: [
		createWorkItemNode
	],

	connections: [
		azureDevOpsConnection
	]
});