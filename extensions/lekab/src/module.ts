import { createExtension } from "@cognigy/extension-tools";

import { sendSMSNode } from "./nodes/sendSMSNode";
import { lekabConnection } from "./connections/lekabConnection";

export default createExtension({
	nodes: [
		sendSMSNode
	],

	connections: [
		lekabConnection
	],
	options: {
		label: "Lekab"
	}
});
