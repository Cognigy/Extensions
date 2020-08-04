import { createExtension } from "@cognigy/extension-tools";

import { getAllWeather } from "./nodes/getAllWeather";
import { getTemperature } from "./nodes/getTemperature";
import { apiKeyConnection } from "./connections/apiKeyConnection";


export default createExtension({
	nodes: [
		getAllWeather,
		getTemperature
	],

	connections: [
		apiKeyConnection
	]
});