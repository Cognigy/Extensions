import { createExtension } from "@cognigy/extension-tools";

import { dbConnection } from "./connections/dbConnection";
import { getDirectionsNode } from "./nodes/getDirections";


export default createExtension({
	nodes: [
		getDirectionsNode
	],

	connections: [
		dbConnection
	],

	options: {
		label: "Deutsche Bahn"
	}
});