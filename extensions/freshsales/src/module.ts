import { createExtension } from "@cognigy/extension-tools";

import { freshsalesAPIKeyConnection } from "./connections/freshsalesAPIKeyConnection";
import { onFound, onNotFound, searchNode } from "./nodes/search";
import { getInfoNode } from "./nodes/getInfo";


export default createExtension({
	nodes: [
		searchNode,
		onFound,
		onNotFound,

		getInfoNode
	],

	connections: [
		freshsalesAPIKeyConnection
	],

	options: {
		label: "Freshsales"
	}
});