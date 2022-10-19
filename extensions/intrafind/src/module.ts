import { createExtension } from "@cognigy/extension-tools";
// import { intrafindAuthData } from './connections/intrafindAuth';
import { documentSearchNode } from './nodes/documentSearch';

export default createExtension({
	nodes: [
		documentSearchNode
	],
	options: {
		label: "Intrafind"
	}
});