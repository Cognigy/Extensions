import { createExtension } from "@cognigy/extension-tools";

import { neo4jQuery } from "./nodes/neo4jQuery";
import { neo4jConnection, neo4jOpenAiKey } from "./connections/neo4jConnection";


export default createExtension({
	nodes: [
		neo4jQuery
	],

	connections: [
		neo4jConnection,
		neo4jOpenAiKey
	],

	options: {
		label: "Neo4j"
	}
});