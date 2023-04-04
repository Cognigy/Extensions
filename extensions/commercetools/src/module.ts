import { createExtension } from "@cognigy/extension-tools";
import { commercetoolsConnection } from "./connections/commercetoolsConnection";
import { getCustomerNode, onFoundCustomer, onNotFoundCustomer } from "./nodes/getCustomer";
import { getOrdersNode, onFoundOrders, onNotFoundOrders } from "./nodes/getOrders";
import { onFoundProducts, onNotFoundProducts, searchProductsNode } from "./nodes/searchProducts";
import { onNoSuggestions, onSuggestions, suggestProductsNode } from "./nodes/suggestProducts";



export default createExtension({
	nodes: [
		getCustomerNode,
		onFoundCustomer,
		onNotFoundCustomer,

		getOrdersNode,
		onFoundOrders,
		onNotFoundOrders,

		searchProductsNode,
		onFoundProducts,
		onNotFoundProducts,

		suggestProductsNode,
		onSuggestions,
		onNoSuggestions
	],

	connections: [
		commercetoolsConnection
	],

	options: {
		label: "commercetools"
	}
});