import { createExtension } from "@cognigy/extension-tools";
import { findStopsNode } from "./nodes/findStops";
import { getStopInfoNode } from "./nodes/getStopInfo";


export default createExtension({
	nodes: [
		findStopsNode,
		getStopInfoNode
	],
	options: {
		label: "BVG"
	}
});