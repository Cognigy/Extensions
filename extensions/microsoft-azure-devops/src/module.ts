import { createExtension } from "@cognigy/extension-tools";
import { azureDevOpsConnection } from "./connections/azureDevOpsConnection";
import { createWorkItemNode } from "./nodes/createWorkItem";
import { getWorkItemNode, onFoundWorkItem, onNotFoundWorkItem } from "./nodes/getWorkItem";

export default createExtension({
	nodes: [
		createWorkItemNode,

		getWorkItemNode,
		onFoundWorkItem,
		onNotFoundWorkItem
	],

	connections: [
		azureDevOpsConnection
	]
});