import { createExtension } from "@cognigy/extension-tools";
import { dynamicYieldConnection } from "./connections/dynamicYieldConnection";
import { chooseNode } from "./nodes/choose";


export default createExtension({
	nodes: [
		chooseNode
	],

	connections: [
		dynamicYieldConnection
	],

	options: {
		label: "Dynamic Yield"
	}
});