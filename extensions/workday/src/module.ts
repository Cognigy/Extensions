import { createExtension } from "@cognigy/extension-tools";
import { workdayConnection } from "./connections/workdayConnection";
import { getWorkersNode } from "./nodes/workers/getWorkers";


export default createExtension({
	nodes: [
		getWorkersNode
	],

	connections: [
		workdayConnection
	],

	options: {
		label: "Workday"
	}
});