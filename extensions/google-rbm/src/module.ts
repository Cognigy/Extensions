import { createExtension } from "@cognigy/extension-tools";
import { serviceAccountConnection } from "./connections/serviceAccountConnection";
import { authenticateNode } from "./nodes/authenticate";

export default createExtension({
	nodes: [
		authenticateNode
	],

	connections: [
		serviceAccountConnection
	],

	options: {
		label: "Google Chat"
	}
});