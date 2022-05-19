import { createExtension } from "@cognigy/extension-tools";
import { sapC4CAPIKeyConnection } from "./connections/sapC4CAPIKeyConnection";
import { getContactsNode, onFoundContact, onNotFoundContact } from "./nodes/contactCollection/getContacts";
import { getAccountsNode, onFoundAccount, onNotFoundAccount } from "./nodes/corperateAccountCollection/getAccounts";
import { getIndividualCustomersNode, onFoundIndividualCustomer, onNotFoundIndividualCustomer } from "./nodes/individualCustomerCollection/getIndividualCustomers";




export default createExtension({
	nodes: [
		getContactsNode,
		onFoundContact,
		onNotFoundContact,

		getAccountsNode,
		onFoundAccount,
		onNotFoundAccount,

		getIndividualCustomersNode,
		onFoundIndividualCustomer,
		onNotFoundIndividualCustomer
	],

	connections: [
		sapC4CAPIKeyConnection
	],

	options: {
		label: "SAP C4C"
	}
});