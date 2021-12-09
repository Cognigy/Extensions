import { createExtension } from "@cognigy/extension-tools";

import { getTokenNode } from "./nodes/getToken";
import { microsoftBotAuthInfo } from "./connections/microsoftBotAuthInfo";



export default createExtension({
	nodes: [
		getTokenNode
	],
	connections: [
		microsoftBotAuthInfo
	],

	options: {
		label: "Microsoft Bot Auth"
	}
});