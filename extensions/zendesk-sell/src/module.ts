import { createExtension } from "@cognigy/extension-tools";
import { zendeskSellOAuth2AccessTokenConnection } from "./connections/zendeskSellOAuth2AccessTokenConnection";
import { searchNode } from "./nodes/search";



export default createExtension({
	nodes: [
		searchNode
	],

	connections: [
		zendeskSellOAuth2AccessTokenConnection
	],

	options: {
		label: "Zendesk Sell"
	}
});