import { createExtension } from "@cognigy/extension-tools";
import { storeAPIConnection } from "./connections/storeAPIConnection";
import { getAllBrandsNode } from "./nodes/brands/getAllBrands";
import { getAllCategoriesNode } from "./nodes/categories/getAllCategories";
import { getAllProductsNode } from "./nodes/products/getAllProducts";

export default createExtension({
	nodes: [
		getAllProductsNode,
		getAllBrandsNode,
		getAllCategoriesNode
	],

	connections: [
		storeAPIConnection
	],

	options: {
		label: "BigCommerce"
	}
});