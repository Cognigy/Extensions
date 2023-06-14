import { createExtension } from "@cognigy/extension-tools";
import { executeQueriesNode } from "./nodes/search";
import { bingConnection } from "./connections/bingConnection";


export default createExtension({
	nodes: [
		executeQueriesNode
	],

	connections: [
		bingConnection
	],

	options: {
		label: "Microsoft Bing"
	}
});