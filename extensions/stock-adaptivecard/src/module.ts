import { createExtension } from "@cognigy/extension-tools";

import { stockNode } from "./nodes/stock";
import { iexConnection } from "./connections/iexConnection";

export default createExtension({
	nodes: [stockNode],
	connections: [iexConnection],
	options: {
		label: "Stock Adaptive Card"
	}
});