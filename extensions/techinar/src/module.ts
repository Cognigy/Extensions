import { createExtension } from "@cognigy/extension-tools";

import { weatherConnection } from "./connections/weatherConnection";
import { getWeatherNode } from "./nodes/getWeatherSimple";
import { getWeatherAdvancedNode, onError, onSuccess } from "./nodes/getWeatherAdvanced";


export default createExtension({
	nodes: [
		getWeatherNode,
		getWeatherAdvancedNode,
		onSuccess,
		onError
	],

	connections: [
		weatherConnection
	]
});