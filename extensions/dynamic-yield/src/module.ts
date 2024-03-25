import { createExtension } from "@cognigy/extension-tools";
import { dynamicYieldConnection } from "./connections/dynamicYieldConnection";
import { chooseNode, onFound, onNotFound } from "./nodes/choose";


export default createExtension({
	nodes: [
		chooseNode,
		onFound,
		onNotFound
	],

	connections: [
		dynamicYieldConnection
	],

	options: {
		label: "Dynamic Yield"
	}
});