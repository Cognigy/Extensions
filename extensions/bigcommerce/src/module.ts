import { createExtension } from "@cognigy/extension-tools";
import { storeAPIConnection } from "./connections/storeAPIConnection";
import { getAllBrandsNode } from "./nodes/brands/getAllBrands";
import { getAllCategoriesNode } from "./nodes/categories/getAllCategories";
import { getCustomerNode } from "./nodes/customer/getCustomer";
import { onInvalid, onValid, validateCustomerNode } from "./nodes/customer/validateCustomer";
import { getAllProductsNode } from "./nodes/products/getAllProducts";

export default createExtension({
	nodes: [
		// getAllProductsNode,
		getAllBrandsNode,
		getAllCategoriesNode,

		validateCustomerNode,
		onValid,
		onInvalid,

		getCustomerNode
	],

	connections: [
		storeAPIConnection
	],

	options: {
		label: "BigCommerce"
	}
});