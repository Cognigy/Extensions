import { createExtension } from "@cognigy/extension-tools";
import { executeQueriesNode } from "./nodes/executeQueries";


export default createExtension({
	nodes: [
		executeQueriesNode
	],

	options: {
		label: "Microsoft PowerBI"
	}
});