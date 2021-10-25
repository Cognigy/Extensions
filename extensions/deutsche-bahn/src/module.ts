import { createExtension } from "@cognigy/extension-tools";

import { dbConnection } from "./connections/dbConnection";
import { onError, onSucces, translateTextNode } from "./nodes/translateText";


export default createExtension({
	nodes: [
		translateTextNode,
		onSucces,
		onError
	],

	connections: [
		dbConnection
	],

	options: {
		label: "Deutsche Bahn"
	}
});