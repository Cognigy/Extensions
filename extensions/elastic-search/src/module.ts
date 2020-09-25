import { createExtension } from "@cognigy/extension-tools";
import { apiKeyConnection } from "./connections/apiKeyConnection";
import { basicConnection } from "./connections/basicConnection";
import { cloudConnection } from "./connections/cloudConnection";
import { searchNode } from "./nodes/search";
import { showResultsNode } from "./nodes/showResults";


export default createExtension({
	nodes: [
		searchNode,
		showResultsNode
	],

	connections: [
		cloudConnection,
		basicConnection,
		apiKeyConnection
	]
});