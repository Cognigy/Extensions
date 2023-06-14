import { createExtension } from "@cognigy/extension-tools";
import { executeQueriesNode } from "./nodes/executeQueries";
import { powerBIConnection } from "./connections/powerBIConnection";


export default createExtension({
	nodes: [
		executeQueriesNode
	],

	connections: [
		powerBIConnection
	],

	options: {
		label: "Microsoft PowerBI"
	}
});