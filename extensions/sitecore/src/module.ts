import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { getChildren } from "./nodes/getChildren";
import { getItem } from "./nodes/getItem";
import { search } from "./nodes/search";

/* import all connections */
import { sitecoreConnection } from "./connections/basicConnection";

export default createExtension({
	nodes: [
		getItem,
		getChildren,
		search
	],

	connections: [
		sitecoreConnection
	]
});