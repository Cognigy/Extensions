import { createExtension } from "@cognigy/extension-tools";

import { ratingCardNode } from "./nodes/rating";

export default createExtension({
	nodes: [
		ratingCardNode
	]
});