import { createExtension } from "@cognigy/extension-tools";
// import { intrafindAuthData } from './connections/intrafindAuth';
import { onEmptyResults, onFoundResults, documentSearchNode } from './nodes/documentSearch';

export default createExtension({
	nodes: [
		documentSearchNode,
		onFoundResults,
		onEmptyResults
	],
	options: {
		label: "Intrafind"
	}
});