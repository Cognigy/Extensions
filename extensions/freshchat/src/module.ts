import { createExtension } from "@cognigy/extension-tools";

import { freshchatConnection } from "./connections/freshchatConnection";
import { handoverNode } from "./nodes/handover";


export default createExtension({
	nodes: [
		handoverNode
	],

	connections: [
		freshchatConnection
	],

	options: {
		label: "Freshchat"
	}
});