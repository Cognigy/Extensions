import { createExtension } from "@cognigy/extension-tools";
import { apiKeyConnection } from "./connections/apiKeyConnection";
import { basicConnection } from "./connections/basicConnection";
import { cloudConnection } from "./connections/cloudConnection";
import { searchNode } from "./nodes/search";


export default createExtension({
	nodes: [
		searchNode
	],

	connections: [
		cloudConnection,
		basicConnection,
		apiKeyConnection
	]
});