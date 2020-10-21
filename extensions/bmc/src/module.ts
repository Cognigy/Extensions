import { createExtension } from "@cognigy/extension-tools";

import { createIncidentNode } from "./nodes/helix/createIncident";
import { bmcConnection } from "./connections/bmcConnection";


export default createExtension({
	nodes: [
		createIncidentNode
	],

	connections: [
		bmcConnection
	]
});