import { createExtension } from "@cognigy/extension-tools";
import { diffbotConnector } from "./knowledge-connectors/diffbotConnector";
import { diffbotConnection } from "./connections/diffbotConnection";

export default createExtension({
	connections: [
		diffbotConnection
	],
	nodes: [
	],
	knowledge: [
		diffbotConnector
	],
	options: {
		label: "Diffbot Extension"
	},
});
