import {createExtension, createKnowledgeDescriptor} from "@cognigy/extension-tools";

/* import all connections */
import { apiKeyConnection } from "./connections/apiKeyConnection";

/* import all connections */
import {confluenceImport} from "./knowledge";

export default createExtension({
	nodes: [
	],

	knowledge: [
		confluenceImport,
	],

	connections: [
		apiKeyConnection
	]
});