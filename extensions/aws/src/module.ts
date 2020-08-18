import { createExtension } from "@cognigy/extension-tools";

import { sayPollyNode } from "./nodes/sayPolly";
import { awsConnection } from "./connections/awsConnection";


export default createExtension({
	nodes: [
		sayPollyNode
	],

	connections: [
		awsConnection
	]
});