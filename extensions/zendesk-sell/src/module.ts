import { createExtension } from "@cognigy/extension-tools";
import { zendeskSellOAuth2AccessTokenConnection } from "./connections/zendeskSellOAuth2AccessTokenConnection";
import { onFoundContacts, onNotFoundContacts, searchContactsNode } from "./nodes/search";
import { getContactDetailsNode } from "./nodes/getContactDetails";



export default createExtension({
	nodes: [
		searchContactsNode,
		onFoundContacts,
		onNotFoundContacts,

		getContactDetailsNode
	],

	connections: [
		zendeskSellOAuth2AccessTokenConnection
	],

	options: {
		label: "Zendesk Sell"
	}
});