import { createExtension } from "@cognigy/extension-tools";

import { showGoogleMaps } from "./nodes/showGoogleMaps";
import { getLocationFromText } from "./nodes/getLocationFromText";
import { apiKeyConnection } from "./connections/apiKeyConnection";


export default createExtension({
	nodes: [
		showGoogleMaps,
		getLocationFromText
	],

	connections: [
		apiKeyConnection
	]
});