import { createExtension } from "@cognigy/extension-tools";
import { diffbotConnection } from "./connections/diffbotConnection";
import { diffbotCrawlerConnector } from "./knowledge-connectors/diffbotCrawlerConnector";
import { diffbotWebpageConnector } from "./knowledge-connectors/diffbotWebpageConnector";

export default createExtension({
	connections: [diffbotConnection],
	nodes: [],
	knowledge: [diffbotCrawlerConnector, diffbotWebpageConnector],
	options: {
		label: "Diffbot Extension",
	},
});
