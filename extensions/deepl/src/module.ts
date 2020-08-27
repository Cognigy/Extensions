import { createExtension } from "@cognigy/extension-tools";

import { deeplConnection } from "./connections/deeplConnection";
import { translateTextNode } from "./nodes/translateText";


export default createExtension({
	nodes: [
		translateTextNode
	],

	connections: [
		deeplConnection
	]
});