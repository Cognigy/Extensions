import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { reverseSay } from "./nodes/reverseSay";
import { executeCognigyApiRequest } from "./nodes/executeCognigyApiRequest";
import { randomPath, randomPathLeft, randomPathRight } from "./nodes/randomPath";
import { fullExample } from "./nodes/fullExample";

/* import all connections */
import { apiKeyConnection } from "./connections/apiKeyConnection";

export default createExtension({
	nodes: [
		reverseSay,
		executeCognigyApiRequest,

		randomPath,
		randomPathLeft,
		randomPathRight,
		fullExample
	],

	connections: [
		apiKeyConnection
	]
});