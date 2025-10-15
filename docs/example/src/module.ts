import { createExtension } from "@cognigy/extension-tools";
/* import Connections */
import { apiKeyConnection } from "./connections/apiKeyConnection";
/* import Knowledge Connectors */
import { simpleKnowledgeConnector } from "./knowledge-connectors/simpleKnowledgeConnector";
/* import Nodes */
import { executeCognigyApiRequest } from "./nodes/executeCognigyApiRequest";
import { fullExample } from "./nodes/fullExample";
import {
	randomPath,
	randomPathLeft,
	randomPathRight,
} from "./nodes/randomPath";
import { reverseSay } from "./nodes/reverseSay";

export default createExtension({
	nodes: [
		reverseSay,
		executeCognigyApiRequest,

		randomPath,
		randomPathLeft,
		randomPathRight,
		fullExample,
	],
	connections: [apiKeyConnection],
	knowledge: [simpleKnowledgeConnector],
});
