import { createExtension } from "@cognigy/extension-tools";
import { commercetoolsConnection } from "./connections/commercetoolsConnection";
import { getCustomerNode, onFoundCustomer, onNotFoundCustomer } from "./nodes/getCustomer";



export default createExtension({
	nodes: [
		getCustomerNode,
		onFoundCustomer,
		onNotFoundCustomer
	],

	connections: [
		commercetoolsConnection
	],

	options: {
		label: "commercetools"
	}
});