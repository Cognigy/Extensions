import { createExtension } from "@cognigy/extension-tools";
import { getStreetsNode } from "./nodes/getStreet";
import { getCitiesNode } from "./nodes/getCities";


export default createExtension({
	nodes: [
		getStreetsNode,
		getCitiesNode
	],
	options: {
		label: "German Postcode Lookup"
	}
});