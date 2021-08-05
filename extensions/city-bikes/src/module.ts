import { createExtension } from "@cognigy/extension-tools";

import { getStationFromText } from "./nodes/getStationFromText";
import { apiKeyConnection } from "./connections/apiKeyConnection";


export default createExtension({
	nodes: [

		getStationFromText
	],

	connections: [
		apiKeyConnection
	]
});