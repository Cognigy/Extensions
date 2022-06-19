import { createExtension } from "@cognigy/extension-tools";
import { storeAPIConnection } from "./connections/storeAPIConnection";
import { getAllBrandsNode } from "./nodes/brands/getAllBrands";
import { getAllCategoriesNode } from "./nodes/categories/getAllCategories";
import { onInvalid, onValid, validateCustomerNode } from "./nodes/customer/validateCustomer";
import { getAllProductsNode } from "./nodes/products/getAllProducts";

export default createExtension({
	nodes: [
		getAllProductsNode,
		getAllBrandsNode,
		getAllCategoriesNode,

		validateCustomerNode,
		onValid,
		onInvalid
	],

	connections: [
		storeAPIConnection
	],

	options: {
		label: "BigCommerce"
	}
});