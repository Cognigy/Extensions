import { createExtension } from "@cognigy/extension-tools";

import { patternMatcherNode } from "./nodes/patternMatcher";

export default createExtension({
	nodes: [
		patternMatcherNode
	],
	connections: [
	]
});