import { createExtension } from "@cognigy/extension-tools";

import { showGoogleMaps } from "./nodes/showGoogleMaps";
import { getLocationFromText } from "./nodes/getLocationFromText";
import { apiKeyConnection } from "./connections/apiKeyConnection";
import { getDirectionsNode } from "./nodes/getDirections";


export default createExtension({
	nodes: [
		showGoogleMaps,
		getLocationFromText,
		getDirectionsNode
	],

	connections: [
		apiKeyConnection
	],

	options: {
		label: "Google Maps"
	}
});