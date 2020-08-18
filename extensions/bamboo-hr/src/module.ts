import { createExtension } from "@cognigy/extension-tools";

import { getAllEmployeesNode } from "./nodes/getAllEmployees";
import { bambooConnection } from "./connections/bambooConnection";


export default createExtension({
	nodes: [
		getAllEmployeesNode
	],

	connections: [
		bambooConnection
	]
});