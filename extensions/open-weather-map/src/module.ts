import { createExtension } from "@cognigy/extension-tools";

import { getAllWeather } from "./nodes/getAllWeather";
import { apiKeyConnection } from "./connections/apiKeyConnection";


export default createExtension({
	nodes: [
		getAllWeather
	],

	connections: [
		apiKeyConnection
	],

	options: {
		label: "Open Weather Map"
	}
});