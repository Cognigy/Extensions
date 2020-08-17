import { createExtension } from "@cognigy/extension-tools";

import { startSimpleProcessNode } from "./nodes/startSimpleProcess";
import { blueprismConnection } from "./connections/blueprismConnection";


export default createExtension({
	nodes: [
		startSimpleProcessNode
	],

	connections: [
		blueprismConnection
	]
});