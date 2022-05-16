import { createExtension } from "@cognigy/extension-tools";
import { sapC4CAPIKeyConnection } from "./connections/sapC4CAPIKeyConnection";
import { getContactsNode, onFoundContact, onNotFoundContact } from "./nodes/contactCollection/getContacts";




export default createExtension({
	nodes: [
		getContactsNode,
		onFoundContact,
		onNotFoundContact
	],

	connections: [
		sapC4CAPIKeyConnection
	],

	options: {
		label: "SAP C4C"
	}
});