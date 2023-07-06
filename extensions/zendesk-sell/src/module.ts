import { createExtension } from "@cognigy/extension-tools";
import { zendeskSellOAuth2AccessTokenConnection } from "./connections/zendeskSellOAuth2AccessTokenConnection";
import { onFoundContacts, onNotFoundContacts, searchContactsNode } from "./nodes/search";



export default createExtension({
	nodes: [
		searchContactsNode,
		onFoundContacts,
		onNotFoundContacts
	],

	connections: [
		zendeskSellOAuth2AccessTokenConnection
	],

	options: {
		label: "Zendesk Sell"
	}
});