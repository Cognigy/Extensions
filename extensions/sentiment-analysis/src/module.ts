import { createExtension } from "@cognigy/extension-tools";

import { getSentimentNode } from "./nodes/getSentiment";


export default createExtension({
	nodes: [
		getSentimentNode
	]
});