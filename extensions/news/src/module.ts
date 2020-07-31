import { createExtension } from "@cognigy/extension-tools";

import { getNewsHeadlines } from "./nodes/getNewsHeadlines";
import { apiKeyConnection } from "./connections/apiKeyConnection";


export default createExtension({
	nodes: [
		getNewsHeadlines
	],

	connections: [
		apiKeyConnection
	]
});