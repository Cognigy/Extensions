import { createExtension } from "@cognigy/extension-tools";

import { camundaConnection } from "./connections/camundaConnection";
import { onProcessFailed, onProcessStarted, startProcessNode } from "./nodes/startProcess";


export default createExtension({
	nodes: [
		startProcessNode,
		onProcessStarted,
		onProcessFailed
	],

	connections: [
		camundaConnection
	],

	options: {
		label: "Camunda"
	}
});
