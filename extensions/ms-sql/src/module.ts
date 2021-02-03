import { createExtension } from "@cognigy/extension-tools";

import { mssqlConnection } from "./connections/mssqlConnection";
import { queryNode } from "./nodes/query";


export default createExtension({
	nodes: [
		queryNode
	],

	connections: [
		mssqlConnection
	]
});