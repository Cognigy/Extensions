import { createExtension } from "@cognigy/extension-tools";
import { googleFirebaseConnection } from "./connections/googleFirebaseConnection";
import { getNode } from "./nodes/get";
import { setNode } from "./nodes/set";
import { updateNode } from "./nodes/update";



export default createExtension({
	nodes: [
		setNode,
		getNode,
		updateNode
	],

	connections: [
		googleFirebaseConnection
	],

	options: {
		label: "Google Firebase"
	}
});