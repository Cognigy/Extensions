import { createExtension } from "@cognigy/extension-tools";

import { rating } from "./nodes/rating";

export default createExtension({
	nodes: [
		rating
	]
});