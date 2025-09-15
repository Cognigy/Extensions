import { createExtension } from "@cognigy/extension-tools";
import { diffbotCrawlerConnector } from "./knowledge-connectors/diffbotCrawlerConnector";
import { diffbotWebpageConnector } from "./knowledge-connectors/diffbotWebpageConnector";

import { diffbotConnection } from "./connections/diffbotConnection";

export default createExtension({
	connections: [
		diffbotConnection
	],
	nodes: [
	],
	knowledge: [
		diffbotCrawlerConnector,
		diffbotWebpageConnector
	],
	options: {
		label: "Diffbot Extension"
	},
});
