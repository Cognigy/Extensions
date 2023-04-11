import { createExtension } from "@cognigy/extension-tools";
import { getStreetsNode } from "./nodes/getStreet";

export default createExtension({
	nodes: [
		getStreetsNode
	],
	options: {
		label: "German Street Lister"
	}
});