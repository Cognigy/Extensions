import { createExtension } from "@cognigy/extension-tools";

import { weatherConnection } from "./connections/weatherConnection";
import { getWeatherNode } from "./nodes/getWeatherSimple";
import { getWeatherAdvancedNode } from "./nodes/getWeatherAdvanced";


export default createExtension({
	nodes: [
		getWeatherNode,
		getWeatherAdvancedNode
	],

	connections: [
		weatherConnection
	]
});